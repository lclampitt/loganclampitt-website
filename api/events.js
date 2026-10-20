// POST /api/events: the one door visitor events come in through.
//
// Caps the body before doing any work, validates every event against the
// shared vocabulary, then inserts with the Supabase service role key. The
// key is read from the server environment only (never a VITE_ variable,
// which would ship it to every browser).
//
// Environment (set in Vercel by Logan):
//   SUPABASE_URL               https://<ref>.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY  the secret key (sb_secret_… or the legacy service_role JWT)
//
// Responses: 202 stored (duplicates are ignored, so a retry is safe; also
// 202 with nothing stored under Global Privacy Control), 400/413/422
// refused for good (the browser drops the batch), 403 wrong origin, 429
// too many batches from one address, 503 not configured, 502 the database
// said no (worth a retry).

import { MAX_BODY_BYTES } from '../shared/events.js'
import { connectingIp } from './_lib/datacenter.js'
import { Refusal, buildRows } from './_lib/ingest.js'
import { overLimit } from './_lib/limit.js'

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  })

// Read at most `max` bytes; anything longer is refused without reading on.
async function readCapped(request, max) {
  const declared = Number(request.headers.get('content-length'))
  if (declared > max) return null
  if (!request.body) return ''
  const reader = request.body.getReader()
  const chunks = []
  let size = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    size += value.byteLength
    if (size > max) {
      await reader.cancel()
      return null
    }
    chunks.push(value)
  }
  return new TextDecoder().decode(Buffer.concat(chunks))
}

// Same origin only: the site's own pages post here, nobody else's.
// Browsers send Origin on every POST, beacons included; the
// Sec-Fetch-Site fallback covers one that leaves it out. A script can fake
// both, so this is a speed bump, not the gate: validation and the rate
// limit are.
function sameOrigin(request) {
  const origin = request.headers.get('origin')
  if (!origin) return request.headers.get('sec-fetch-site') === 'same-origin'
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host')
  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}

// New secret keys (sb_secret_…) go in the apikey header only; the legacy
// service_role JWT also goes in Authorization.
function supabaseHeaders(key) {
  const headers = { apikey: key, 'content-type': 'application/json' }
  if (key.startsWith('eyJ')) headers.authorization = `Bearer ${key}`
  return headers
}

export async function POST(request) {
  if (!sameOrigin(request)) return json(403, { error: 'wrong_origin' })
  if (overLimit(connectingIp(request.headers), Date.now())) return json(429, { error: 'slow_down' })
  // The browser checks Global Privacy Control before sending anything;
  // this catches a browser or extension that sends only the header.
  if (request.headers.get('sec-gpc') === '1') return json(202, { received: 0, stored: 0 })

  const text = await readCapped(request, MAX_BODY_BYTES)
  if (text === null) return json(413, { error: 'too_large', max_bytes: MAX_BODY_BYTES })

  let body
  try {
    body = JSON.parse(text)
  } catch {
    return json(400, { error: 'bad_json' })
  }

  let rows
  try {
    ;({ rows } = buildRows(body, request.headers, { now: Date.now(), vercelEnv: process.env.VERCEL_ENV }))
  } catch (err) {
    if (err instanceof Refusal) return json(err.status, { error: 'refused', reason: err.reason })
    throw err
  }
  if (rows.length === 0) return json(202, { received: 0, stored: 0 })

  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return json(503, { error: 'not_configured' })

  let res
  try {
    res = await fetch(`${url.replace(/\/$/, '')}/rest/v1/events?on_conflict=event_id&select=event_id`, {
      method: 'POST',
      headers: { ...supabaseHeaders(key), prefer: 'resolution=ignore-duplicates,return=representation' },
      body: JSON.stringify(rows),
    })
  } catch {
    console.error('events: database unreachable')
    return json(502, { error: 'store_failed' })
  }
  if (!res.ok) {
    // Status only: the error text can quote row values.
    console.error(`events: insert failed with ${res.status}`)
    return json(502, { error: 'store_failed' })
  }
  const stored = await res.json().then((r) => (Array.isArray(r) ? r.length : null), () => null)
  return json(202, { received: rows.length, stored })
}
