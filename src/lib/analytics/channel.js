// Where a visit came from, as a channel bucket plus its source (a host
// or a utm_source). Read once per page load from the landing URL and
// document.referrer.
//
// Order matters, first match wins: paid tags beat everything, then AI
// assistants, webmail (before search: mail.google.com is not Google
// search), search engines, social, a tagged campaign, any other site,
// direct.

import { cleanSource } from '../../../shared/events.js'

// Hosts are compared after `www.` is stripped. Search engines match their
// own host only, so docs.google.com or mail.yahoo.com never count as search.
const AI = /(^|\.)(chatgpt\.com|chat\.openai\.com|perplexity\.ai|claude\.ai|gemini\.google\.com|copilot\.microsoft\.com|you\.com|phind\.com)$/
const WEBMAIL = /^(mail\.google\.com|outlook\.live\.com|outlook\.office\.com|outlook\.office365\.com|mail\.yahoo\.com|mail\.proton\.me)$/
const SEARCH = /^(google\.[a-z]{2,3}(\.[a-z]{2})?|bing\.com|duckduckgo\.com|search\.yahoo\.com|ecosia\.org|search\.brave\.com|yandex\.[a-z]{2,3}|baidu\.com|startpage\.com|kagi\.com)$/
const SOCIAL = /(^|\.)(linkedin\.com|lnkd\.in|twitter\.com|t\.co|x\.com|facebook\.com|fb\.com|instagram\.com|reddit\.com|news\.ycombinator\.com|youtube\.com|tiktok\.com|threads\.net|bsky\.app|mastodon\.social|discord\.com)$/

// Android apps send `android-app://<package>/` as the referrer.
const APPS = {
  'com.linkedin.android': ['social', 'linkedin.com'],
  'com.google.android.gm': ['email', 'gmail'],
  'com.microsoft.office.outlook': ['email', 'outlook'],
  'com.google.android.googlequicksearchbox': ['organic_search', 'google.com'],
  'com.twitter.android': ['social', 'x.com'],
  'com.reddit.frontpage': ['social', 'reddit.com'],
  'com.slack': ['referral', 'slack.com'],
  'com.discord': ['social', 'discord.com'],
}

const hostOf = (url) => {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, '')
  } catch {
    return null
  }
}

const param = (params, name) => {
  const v = params.get(name)
  return v && v.trim() ? v.trim().slice(0, 256) : null
}

// Returns { external, channel, source }. `external` is true for an
// arrival from outside: a tag, another site's referrer, or LinkedIn's in
// app browser. A reload or back/forward is never an arrival, even though
// the browser keeps the referrer and the tagged URL for them.
export function classifyArrival(href, referrer, siteHost, { navType = 'navigate', userAgent = '' } = {}) {
  let params
  try {
    params = new URL(href).searchParams
  } catch {
    params = new URLSearchParams()
  }
  const site = (siteHost || '').toLowerCase().replace(/^www\./, '')
  const utmSource = param(params, 'utm_source')
  const utmMedium = (param(params, 'utm_medium') || '').toLowerCase()
  const clickId = param(params, 'gclid') ? 'google' : param(params, 'msclkid') ? 'bing' : param(params, 'fbclid') ? 'facebook' : null
  const app = referrer && referrer.startsWith('android-app://') ? APPS[hostOf(referrer)] ?? null : null
  const refHost = referrer && !app ? hostOf(referrer) : null
  const foreignRef = refHost && refHost !== site ? refHost : null
  // The iOS LinkedIn app opens links with no referrer at all; its user
  // agent is the only sign of where the visit came from.
  const linkedinApp = !foreignRef && !app && /LinkedInApp/i.test(userAgent)
  const revisit = navType === 'reload' || navType === 'back_forward'
  const external = !revisit && Boolean(utmSource || clickId || foreignRef || app || linkedinApp)

  const result = (channel, source) => ({ external, channel, source: cleanSource(source) })

  if (clickId || /^(cpc|ppc|paid|paidsearch|paidsocial|display|ads?)$/.test(utmMedium)) {
    return result('paid', utmSource || clickId || foreignRef)
  }
  if (app) return result(app[0], app[1])
  if (linkedinApp) return result('social', 'linkedin.com')
  if (foreignRef && AI.test(foreignRef)) return result('ai', foreignRef)
  if (/^(chatgpt|openai|perplexity|claude|gemini|copilot)/i.test(utmSource || '')) return result('ai', utmSource)
  if (/^(email|newsletter|e-mail)$/.test(utmMedium) || (foreignRef && WEBMAIL.test(foreignRef))) {
    return result('email', utmSource || foreignRef)
  }
  if (foreignRef && SEARCH.test(foreignRef)) return result('organic_search', foreignRef)
  if (utmMedium === 'social' || (foreignRef && SOCIAL.test(foreignRef))) return result('social', utmSource || foreignRef)
  if (utmSource) return result('campaign', utmSource)
  if (foreignRef) return result('referral', foreignRef)
  return result('direct', null)
}
