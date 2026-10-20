// Reads the user agent once per batch and keeps only family names. The
// raw string is never stored or logged.
//
// Only crawlers that run JavaScript ever reach api/events.js (the event
// is sent by the page's own script), so this list is about rendering
// crawlers and automation, not link preview fetchers.

// Named crawlers, plus the two conventions almost every crawler follows:
// a "name-bot/1.0" token, or a "+https://…" contact URL.
const CRAWLER =
  /googlebot|google-inspectiontool|googleother|adsbot|mediapartners|storebot|bingbot|bingpreview|duckduckbot|yandex|baiduspider|sogou|applebot|amazonbot|gptbot|oai-searchbot|chatgpt-user|claudebot|claude-user|perplexitybot|ccbot|bytespider|petalbot|ahrefsbot|semrushbot|mj12bot|dotbot|linkedinbot|twitterbot|facebookexternalhit|slackbot|discordbot|telegrambot|ia_archiver|lighthouse|pagespeed|gtmetrix|pingdom|uptimerobot|statuscake/i
const BOT_TOKEN = /[\w-]*(bot|crawler|spider|scraper)\/\d/i
const CONTACT_URL = /\+https?:\/\//i
const HEADLESS = /HeadlessChrome|PhantomJS|Puppeteer|Playwright|Selenium|Cypress/i
// HTTP libraries announce themselves at the start of the string.
const LIBRARY = /^(curl|wget|python|go-http-client|axios|node-fetch|node|undici|okhttp|java|libwww|httpie|postmanruntime|insomnia|ruby|php|scrapy)\b/i

function browserOf(ua) {
  if (/LinkedInApp/i.test(ua)) return 'LinkedIn app'
  if (/Instagram/i.test(ua)) return 'Instagram app'
  if (/FBAN|FBAV/i.test(ua)) return 'Facebook app'
  if (/Edg(e|A|iOS)?\//.test(ua)) return 'Edge'
  if (/OPR\/|Opera/.test(ua)) return 'Opera'
  if (/SamsungBrowser\//.test(ua)) return 'Samsung Internet'
  if (/Firefox\/|FxiOS\//.test(ua)) return 'Firefox'
  if (/CriOS\/|Chrome\//.test(ua)) return 'Chrome'
  if (/Version\/[\d.]+.*Safari\//.test(ua)) return 'Safari'
  return null
}

function osOf(ua) {
  if (/iPad/.test(ua)) return 'iPadOS'
  if (/iPhone|iPod/.test(ua)) return 'iOS'
  if (/Android/.test(ua)) return 'Android'
  if (/Windows/.test(ua)) return 'Windows'
  if (/CrOS/.test(ua)) return 'ChromeOS'
  if (/Macintosh|Mac OS X/.test(ua)) return 'macOS'
  if (/Linux/.test(ua)) return 'Linux'
  return null
}

function deviceOf(ua, browser, os) {
  if (/iPad|Tablet/i.test(ua) || (/Android/.test(ua) && !/Mobile/.test(ua))) return 'tablet'
  if (/Mobi|iPhone|iPod/.test(ua)) return 'phone'
  // Desktop only on an affirmative read; otherwise could not tell.
  return browser && os ? 'desktop' : null
}

export function readUserAgent(raw) {
  const ua = typeof raw === 'string' ? raw.slice(0, 1000) : ''
  if (!ua) return { crawler: false, headless: false, browser: null, os: null, device: null }
  const crawler = CRAWLER.test(ua) || BOT_TOKEN.test(ua) || CONTACT_URL.test(ua) || LIBRARY.test(ua)
  const headless = HEADLESS.test(ua)
  const browser = crawler || headless ? null : browserOf(ua)
  const os = osOf(ua)
  return { crawler, headless, browser, os, device: crawler ? null : deviceOf(ua, browser, os) }
}
