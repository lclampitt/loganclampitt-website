// Turns one request body into rows for public.events, or a refusal. Pure:
// no network, no clock of its own, so tests can drive it directly.
//
// The browser sends { events: [...], viewport_width, viewport_height,
// automation }. Everything the server knows better (place, device, bot,
// arrival time, which deployment) is decided here from the request, never
// copied from the body.

import { CHANNELS, EVENT_SCHEMA, MAX_BATCH, cleanSource } from '../../shared/events.js'
import { connectingIp, isDatacenterIp } from './datacenter.js'
import { readUserAgent } from './ua.js'

const CLOCK_PAST_TOLERANCE_MS = 30 * 24 * 60 * 60 * 1000
const CLOCK_FUTURE_TOLERANCE_MS = 24 * 60 * 60 * 1000
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const HAS_ZONE = /(Z|[+-]\d{2}:?\d{2})$/i

class Refusal extends Error {
  constructor(status, reason) {
    super(reason)
    this.status = status
    this.reason = reason
  }
}
const refuse = (status, reason) => {
  throw new Refusal(status, reason)
}

// Believe the browser's clock only within 30 days back and 24 hours ahead.
// Outside that the time is kept, labelled 'implausible', and reads use the
// arrival time instead (the generated `at` column).
export function classifyClock(occurredAt, now) {
  if (occurredAt == null || occurredAt === '') return { occurred_at: null, clock_source: 'absent' }
  if (typeof occurredAt !== 'string' || occurredAt.length > 40) refuse(422, 'occurred_at must be an ISO time')
  const zoned = HAS_ZONE.test(occurredAt)
  const t = Date.parse(zoned ? occurredAt : `${occurredAt}Z`)
  if (Number.isNaN(t)) refuse(422, 'occurred_at must be an ISO time')
  // Postgres refuses year 0 and extended years; refusing here keeps one
  // bad clock from failing the whole insert.
  const year = new Date(t).getUTCFullYear()
  if (year < 1 || year > 9999) refuse(422, 'occurred_at is out of range')
  const iso = new Date(t).toISOString()
  const plausible = zoned && t <= now + CLOCK_FUTURE_TOLERANCE_MS && t >= now - CLOCK_PAST_TOLERANCE_MS
  return { occurred_at: iso, clock_source: plausible ? 'client' : 'implausible' }
}

function cleanProps(name, props) {
  const schema = EVENT_SCHEMA[name]
  const given = props && typeof props === 'object' && !Array.isArray(props) ? props : {}
  const out = {}
  for (const [key, rule] of Object.entries(schema)) {
    const value = given[key]
    if (value == null || value === '') {
      if (rule.required) refuse(422, `${name} needs ${key}`)
      continue
    }
    if (typeof value !== rule.type) refuse(422, `${name}.${key} must be a ${rule.type}`)
    if (rule.oneOf && !rule.oneOf.includes(value)) refuse(422, `${name}.${key} is not a known value`)
    if (rule.max && value.length > rule.max) refuse(422, `${name}.${key} is too long`)
    if (rule.pattern && !rule.pattern.test(value)) refuse(422, `${name}.${key} has unexpected characters`)
    out[key] = value
  }
  return out // undeclared keys are dropped, never stored
}

// location.pathname is always percent encoded, so a real path only ever
// holds URL path characters. Anything else (HTML, spaces, an email) is
// not a page of this site.
const PATH = /^\/[A-Za-z0-9\-._~%!$&'()*+,;=:@/]*$/

function cleanPage(page) {
  if (page == null) return null
  if (typeof page !== 'string' || page.length > 2000) refuse(422, 'page must be a path')
  const path = page.split(/[?#]/)[0].slice(0, 300)
  if (!PATH.test(path)) refuse(422, 'page must be a path')
  return path
}

const cleanChannel = (value) => (CHANNELS.includes(value) ? value : null)

function cleanViewport(value) {
  return Number.isInteger(value) && value >= 1 && value <= 20000 ? value : null
}

// Vercel URL-encodes the city header ("San%20Jose").
function geoHeader(headers, name, max) {
  const raw = headers.get(name)
  if (!raw) return null
  let value = raw
  try {
    value = decodeURIComponent(raw)
  } catch {
    // keep it as sent
  }
  value = value.trim().slice(0, max)
  return value || null
}

function siteEnv(vercelEnv) {
  return vercelEnv === 'production' || vercelEnv === 'preview' ? vercelEnv : 'development'
}

// Returns { rows } or throws a Refusal with a status for the response.
export function buildRows(body, headers, { now, vercelEnv }) {
  if (!body || typeof body !== 'object' || !Array.isArray(body.events)) refuse(400, 'expected { events: [...] }')
  if (body.events.length === 0) return { rows: [] }
  if (body.events.length > MAX_BATCH) refuse(413, `at most ${MAX_BATCH} events per batch`)

  // Per batch: what the request itself says about where it came from.
  const ua = readUserAgent(headers.get('user-agent'))
  const fromDatacenter = isDatacenterIp(connectingIp(headers)) === true
  const automation = body.automation === true // navigator.webdriver; can only ever mark a bot
  const bot = ua.crawler || ua.headless || automation || fromDatacenter ? 'bot' : ua.browser ? 'not_bot' : null
  const batch = {
    city: geoHeader(headers, 'x-vercel-ip-city', 120),
    region: geoHeader(headers, 'x-vercel-ip-country-region', 10),
    country: geoHeader(headers, 'x-vercel-ip-country', 2),
    device: ua.device,
    browser: ua.browser,
    os: ua.os,
    viewport_width: cleanViewport(body.viewport_width),
    viewport_height: cleanViewport(body.viewport_height),
    bot,
    site_env: siteEnv(vercelEnv),
  }
  const receivedAt = new Date(now).toISOString()

  const seen = new Set()
  const rows = body.events.map((e, i) => {
    try {
      if (!e || typeof e !== 'object') refuse(422, 'each event must be an object')
      // typeof first: hasOwn would stringify ["Contact_Sent"] and pass it
      if (typeof e.event_name !== 'string' || !Object.hasOwn(EVENT_SCHEMA, e.event_name)) {
        refuse(422, 'unknown event_name')
      }
      if (typeof e.event_id !== 'string' || !UUID.test(e.event_id)) refuse(422, 'event_id must be a uuid')
      if (typeof e.visitor_id !== 'string' || !UUID.test(e.visitor_id)) refuse(422, 'visitor_id must be a uuid')
      if (e.session_id != null && (typeof e.session_id !== 'string' || !UUID.test(e.session_id))) {
        refuse(422, 'session_id must be a uuid')
      }
      if (e.identity_source !== 'persistent' && e.identity_source !== 'ephemeral') {
        refuse(422, 'identity_source must be persistent or ephemeral')
      }
      const id = e.event_id.toLowerCase()
      if (seen.has(id)) refuse(422, 'event_id repeated in one batch')
      seen.add(id)

      return {
        event_id: id,
        event_name: e.event_name,
        ...classifyClock(e.occurred_at, now),
        received_at: receivedAt,
        visitor_id: e.visitor_id.toLowerCase(),
        identity_source: e.identity_source,
        session_id: e.session_id ? e.session_id.toLowerCase() : null,
        page: cleanPage(e.page),
        props: cleanProps(e.event_name, e.props),
        ft_channel: cleanChannel(e.ft_channel),
        ft_source: cleanSource(e.ft_source),
        lt_channel: cleanChannel(e.lt_channel),
        lt_source: cleanSource(e.lt_source),
        ...batch,
      }
    } catch (err) {
      if (err instanceof Refusal) refuse(err.status, `event ${i}: ${err.reason}`)
      throw err
    }
  })
  return { rows }
}

export { Refusal }
