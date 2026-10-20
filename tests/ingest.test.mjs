import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildRows, classifyClock, Refusal } from '../api/_lib/ingest.js'
import { readUserAgent } from '../api/_lib/ua.js'
import { isDatacenterIp } from '../api/_lib/datacenter.js'
import { MAX_BATCH } from '../shared/events.js'

const NOW = Date.parse('2026-10-20T15:00:00Z')
const DAY = 24 * 60 * 60 * 1000
const CHROME_MAC =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36'
const SAFARI_IPHONE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1'

const headers = (extra = {}) => new Headers({ 'user-agent': CHROME_MAC, ...extra })
const event = (over = {}) => ({
  event_id: '0b6b7a8e-6a51-4d0e-9a52-1f0f5f0c2a11',
  event_name: 'Page_Viewed',
  occurred_at: new Date(NOW - 60_000).toISOString(),
  visitor_id: '6f1c2f7e-1d1a-4c1b-8a0e-2b7a9c3d4e5f',
  identity_source: 'persistent',
  session_id: 'a2c4e6f8-1b3d-4f5a-9c7e-0d2f4a6b8c0e',
  page: '/',
  ft_channel: 'referral',
  ft_source: 'github.com',
  lt_channel: 'direct',
  lt_source: null,
  props: {},
  ...over,
})
const build = (body, h = headers(), vercelEnv = 'production') => buildRows(body, h, { now: NOW, vercelEnv })
const refusal = (fn) => {
  try {
    fn()
  } catch (err) {
    if (err instanceof Refusal) return err
    throw err
  }
  assert.fail('expected a refusal')
}

test('a good event becomes one row with server fields decided by the server', () => {
  const h = headers({ 'x-vercel-ip-city': 'San%20Jose', 'x-vercel-ip-country-region': 'CA', 'x-vercel-ip-country': 'US' })
  const { rows } = build({ events: [event()], viewport_width: 1440, viewport_height: 900, city: 'Spoofed', bot: 'not_bot' }, h)
  assert.equal(rows.length, 1)
  const r = rows[0]
  assert.equal(r.clock_source, 'client')
  assert.equal(r.received_at, new Date(NOW).toISOString())
  assert.equal(r.city, 'San Jose')
  assert.equal(r.region, 'CA')
  assert.equal(r.country, 'US')
  assert.equal(r.browser, 'Chrome')
  assert.equal(r.os, 'macOS')
  assert.equal(r.device, 'desktop')
  assert.equal(r.bot, 'not_bot')
  assert.equal(r.viewport_width, 1440)
  assert.equal(r.site_env, 'production')
  assert.equal(r.ft_source, 'github.com')
  assert.equal(r.lt_source, null)
})

test('the clock is believed within 30 days back and 24 hours ahead only', () => {
  assert.equal(classifyClock(new Date(NOW - 29 * DAY).toISOString(), NOW).clock_source, 'client')
  assert.equal(classifyClock(new Date(NOW - 31 * DAY).toISOString(), NOW).clock_source, 'implausible')
  assert.equal(classifyClock(new Date(NOW + 2 * DAY).toISOString(), NOW).clock_source, 'implausible')
  assert.equal(classifyClock('2026-10-20T14:00:00', NOW).clock_source, 'implausible') // no zone
  assert.deepEqual(classifyClock(null, NOW), { occurred_at: null, clock_source: 'absent' })
  assert.equal(refusal(() => classifyClock('yesterday', NOW)).status, 422)
})

test('the page keeps the path and drops any query string', () => {
  const { rows } = build({ events: [event({ page: '/projects/x?utm_source=li#top' })] })
  assert.equal(rows[0].page, '/projects/x')
})

test('undeclared props are dropped and declared ones are checked', () => {
  const { rows } = build({
    events: [event({ event_name: 'Outbound_Link_Clicked', props: { target: 'github', host: 'github.com', email: 'a@b.c' } })],
  })
  assert.deepEqual(rows[0].props, { target: 'github', host: 'github.com' })
  assert.equal(refusal(() => build({ events: [event({ event_name: 'Project_Opened', props: {} })] })).status, 422)
  assert.equal(
    refusal(() => build({ events: [event({ event_name: 'Outbound_Link_Clicked', props: { target: 'myspace' } })] })).status,
    422,
  )
  const contact = build({ events: [event({ event_name: 'Contact_Sent', props: { message: 'hello', email: 'a@b.c' } })] })
  assert.deepEqual(contact.rows[0].props, {})
})

test('unknown names, bad ids and oversized batches are refused', () => {
  assert.equal(refusal(() => build({ events: [event({ event_name: 'Hacked' })] })).status, 422)
  assert.equal(refusal(() => build({ events: [event({ event_id: 'nope' })] })).status, 422)
  assert.equal(refusal(() => build({ events: [event({ identity_source: undefined })] })).status, 422)
  assert.equal(refusal(() => build({ events: [event(), event()] })).status, 422) // repeated id
  const many = Array.from({ length: MAX_BATCH + 1 }, () => event())
  assert.equal(refusal(() => build({ events: many })).status, 413)
  assert.equal(refusal(() => build({ nope: true })).status, 400)
  assert.deepEqual(build({ events: [] }), { rows: [] })
})

test('crawlers, automation and cloud servers are marked bot', () => {
  const googlebot = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
  assert.equal(build({ events: [event()] }, headers({ 'user-agent': googlebot })).rows[0].bot, 'bot')
  assert.equal(build({ events: [event()], automation: true }).rows[0].bot, 'bot')
  // 3.0.0.1 sits inside AWS EC2's published ranges
  assert.equal(build({ events: [event()] }, headers({ 'x-real-ip': '3.0.0.1' })).rows[0].bot, 'bot')
  // a client cannot talk its way out of it
  assert.equal(build({ events: [event()], automation: false, bot: 'not_bot' }, headers({ 'user-agent': 'curl/8.4.0' })).rows[0].bot, 'bot')
  // no user agent at all: could not tell
  assert.equal(build({ events: [event()] }, new Headers()).rows[0].bot, null)
})

test('user agents resolve to families, with in app browsers kept as people', () => {
  assert.deepEqual(
    { ...readUserAgent(SAFARI_IPHONE) },
    { crawler: false, headless: false, browser: 'Safari', os: 'iOS', device: 'phone' },
  )
  const linkedinApp = `${SAFARI_IPHONE} [LinkedInApp]/9.31`
  assert.equal(readUserAgent(linkedinApp).crawler, false)
  assert.equal(readUserAgent(linkedinApp).browser, 'LinkedIn app')
  assert.equal(readUserAgent('LinkedInBot/1.0 (compatible; Mozilla/5.0; +http://www.linkedin.com)').crawler, true)
  const headless = CHROME_MAC.replace('Chrome/', 'HeadlessChrome/')
  assert.equal(readUserAgent(headless).headless, true)
})

test('the data center check answers yes, no, or could not tell', () => {
  assert.equal(isDatacenterIp('3.0.0.1'), true)
  assert.equal(isDatacenterIp('::ffff:3.0.0.1'), true)
  assert.equal(isDatacenterIp('192.168.1.10'), false)
  assert.equal(isDatacenterIp(''), null)
  assert.equal(isDatacenterIp('not an ip'), null)
})

test('preview and local deployments are labelled, never counted as production', () => {
  assert.equal(build({ events: [event()] }, headers(), 'preview').rows[0].site_env, 'preview')
  assert.equal(build({ events: [event()] }, headers(), null).rows[0].site_env, 'development')
})

test('review fixes: hostile values are refused before they reach the database', () => {
  assert.equal(refusal(() => build({ events: [event({ event_name: ['Contact_Sent'] })] })).status, 422)
  assert.equal(refusal(() => build({ events: [event({ page: '/<img src=x onerror=alert(1)>' })] })).status, 422)
  assert.equal(refusal(() => build({ events: [event({ page: '/a\u0000b' })] })).status, 422)
  assert.equal(refusal(() => build({ events: [event({ occurred_at: '0000-01-01T00:00:00Z' })] })).status, 422)
  assert.equal(build({ events: [event({ page: '/projects/ct-realty-trust' })] }).rows[0].page, '/projects/ct-realty-trust')
})

test('a long run of hyphens in a source is cut before it is cleaned', () => {
  const started = performance.now()
  const { rows } = build({ events: [event({ ft_source: '-'.repeat(60000) + 'a' })] })
  assert.ok(performance.now() - started < 100, 'cleanSource should stay fast')
  assert.ok(rows[0].ft_source === null || rows[0].ft_source.length <= 120)
})
