// POST /api/contact: keeps a copy of a contact form message (name, email,
// message) for the console, linked to the visit when that browser is
// tracked. Formspree still delivers the message to Logan; this copy is
// what lets the console show who wrote, under their visitor number
// (owner request 2026-10-20).
//
// This is personal data, so it goes to its own table (contact_messages),
// never to events, and is never logged. Under Global Privacy Control the
// message is kept but not linked to a visit.

import { readCapped } from './_lib/body.js'
import { connectingIp } from './_lib/datacenter.js'
import { createLimiter } from './_lib/limit.js'
import { json, notConfigured, serviceHeaders, siteEnv, supabaseConfig } from './_lib/supabase.js'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
// A plain address only. No ? & # , % or spaces: the console turns this
// into a mailto link, and those would let a sender smuggle a Bcc, extra
// recipients or a ready made subject into Logan's reply.
const EMAIL = /^[A-Za-z0-9._+'-]{1,64}@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*$/
const PATH = /^\/[A-Za-z0-9\-._~%!$&'()*+,;=:@/]*$/

// A person sends a few messages at most.
const overLimit = createLimiter({ max: 5, windowMs: 10 * 60_000 })

function sameOrigin(request) {
  const origin = request.headers.get('origin')
  if (!origin) return false
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host')
  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}

// Trimmed text within a size, or null. Control characters other than
// line breaks are removed (Postgres refuses NUL, and nothing else needs
// them), and a half emoji left by the form's length cut is repaired.
function text(value, max) {
  if (typeof value !== 'string') return null
  // eslint-disable-next-line no-control-regex -- matching control characters is the point
  const cleaned = value.toWellFormed().replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim()
  return cleaned && cleaned.length <= max ? cleaned : null
}

export async function POST(request) {
  if (!sameOrigin(request)) return json(403, { error: 'wrong_origin' })
  if (overLimit(connectingIp(request.headers), Date.now())) return json(429, { error: 'slow_down' })

  // Room for 5000 characters in any script; the fields are capped below.
  const raw = await readCapped(request, 64 * 1024)
  if (raw === null) return json(413, { error: 'too_large' })
  let body
  try {
    body = JSON.parse(raw)
  } catch {
    return json(400, { error: 'bad_json' })
  }

  // The form has a hidden field people never see. A bot that fills every
  // field gets the same answer as a person, and nothing is stored.
  if (typeof body?.website === 'string' && body.website.trim()) return json(202, { stored: true })

  const name = text(body?.name, 200)
  const email = text(body?.email, 320)
  const message = text(body?.message, 5000)
  if (typeof body?.message_id !== 'string' || !UUID.test(body.message_id)) return json(422, { error: 'bad_message_id' })
  if (!name || !email || !EMAIL.test(email) || !message) return json(422, { error: 'bad_message' })

  // Linked to the visit only when the browser sent its ids and did not ask
  // not to be tracked.
  const gpc = request.headers.get('sec-gpc') === '1'
  const visitorId = !gpc && typeof body.visitor_id === 'string' && UUID.test(body.visitor_id) ? body.visitor_id.toLowerCase() : null
  const sessionId = visitorId && typeof body.session_id === 'string' && UUID.test(body.session_id) ? body.session_id.toLowerCase() : null
  const page = typeof body.page === 'string' && PATH.test(body.page) ? body.page.slice(0, 300) : null

  const config = supabaseConfig()
  if (!config) return notConfigured()

  let res
  try {
    res = await fetch(`${config.url}/rest/v1/contact_messages?on_conflict=message_id`, {
      method: 'POST',
      headers: { ...serviceHeaders(config.key), prefer: 'resolution=ignore-duplicates,return=minimal' },
      body: JSON.stringify({
        message_id: body.message_id.toLowerCase(),
        visitor_id: visitorId,
        session_id: sessionId,
        name,
        email,
        message,
        page,
        site_env: siteEnv(),
      }),
    })
  } catch {
    console.error('contact: database unreachable')
    return json(502, { error: 'store_failed' })
  }
  if (!res.ok) {
    // Status only: the error text can quote the message.
    console.error(`contact: insert failed with ${res.status}`)
    return json(502, { error: 'store_failed' })
  }
  return json(202, { stored: true })
}
