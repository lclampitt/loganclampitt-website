// POST /api/console/auth: sign in to the console, keep the session fresh,
// and sign out. Everything goes through Supabase Auth on the server, so
// the browser never holds a Supabase key.
//
//   { action: 'login', email }          sends a magic link, only ever to CONSOLE_EMAIL
//   { action: 'refresh', refresh_token } swaps a refresh token for a new session
//   { action: 'logout' } + bearer token  ends the session at Supabase
//
// Login answers the same for any other address, so the endpoint does not
// confirm which one is right. Supabase sign ups are off; the link is sent
// with create_user false as well.

import { readCapped } from '../_lib/body.js'
import { connectingIp } from '../_lib/datacenter.js'
import { consoleEmail, forgetToken, sameEmail } from '../_lib/console-auth.js'
import { createLimiter } from '../_lib/limit.js'
import { json, supabaseConfig } from '../_lib/supabase.js'

const loginLimit = createLimiter({ max: 5, windowMs: 10 * 60_000 })
const refreshLimit = createLimiter({ max: 30, windowMs: 10 * 60_000 })

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

// Where the link lands: this deployment's own /console, built from the
// request, never from anything the browser sends. Supabase only redirects
// to addresses on its allow list (Auth → URL Configuration).
function consoleUrl(request) {
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host')
  const proto = request.headers.get('x-forwarded-proto') ?? (host?.startsWith('localhost') ? 'http' : 'https')
  return `${proto}://${host}/console`
}

async function readBody(request) {
  const text = await readCapped(request, 8192)
  if (text === null) return null
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

function sessionOut(s) {
  return {
    access_token: s.access_token,
    refresh_token: s.refresh_token,
    expires_at: s.expires_at ?? Math.floor(Date.now() / 1000) + (s.expires_in ?? 3600),
  }
}

export async function POST(request) {
  if (!sameOrigin(request)) return json(403, { error: 'wrong_origin' })
  const config = supabaseConfig()
  const allowed = consoleEmail()
  if (!config || !allowed) return json(503, { error: 'not_configured' })

  const body = await readBody(request)
  if (!body || typeof body.action !== 'string') return json(400, { error: 'bad_request' })
  const address = connectingIp(request.headers)
  const now = Date.now()

  if (body.action === 'login') {
    if (loginLimit(address, now)) return json(429, { error: 'slow_down' })
    if (!sameEmail(body.email, allowed)) return json(202, { sent: true })
    let res
    try {
      res = await fetch(`${config.url}/auth/v1/otp?redirect_to=${encodeURIComponent(consoleUrl(request))}`, {
        method: 'POST',
        headers: { apikey: config.key, 'content-type': 'application/json' },
        body: JSON.stringify({ email: allowed, create_user: false }),
      })
    } catch {
      return json(502, { error: 'send_failed' })
    }
    // Honest with Logan: if Supabase could not send it, say so rather than
    // leave him waiting for an email that is not coming.
    if (!res.ok) {
      console.error(`console auth: magic link failed with ${res.status}`)
      return json(502, { error: 'send_failed', status: res.status })
    }
    return json(202, { sent: true })
  }

  if (body.action === 'refresh') {
    if (refreshLimit(address, now)) return json(429, { error: 'slow_down' })
    if (typeof body.refresh_token !== 'string' || body.refresh_token.length > 512) return json(401, { error: 'signed_out' })
    let res
    try {
      res = await fetch(`${config.url}/auth/v1/token?grant_type=refresh_token`, {
        method: 'POST',
        headers: { apikey: config.key, 'content-type': 'application/json' },
        body: JSON.stringify({ refresh_token: body.refresh_token }),
      })
    } catch {
      return json(502, { error: 'auth_unreachable' })
    }
    // A refused refresh token is signed out; anything else is Supabase
    // having trouble, and the session should survive it.
    if (res.status === 400 || res.status === 401 || res.status === 403) return json(401, { error: 'signed_out' })
    if (!res.ok) return json(502, { error: 'auth_unreachable' })
    const session = await res.json()
    if (!sameEmail(session.user?.email, allowed)) return json(401, { error: 'signed_out' })
    return json(200, sessionOut(session))
  }

  if (body.action === 'logout') {
    const header = request.headers.get('authorization') ?? ''
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : ''
    if (token) {
      forgetToken(token) // this instance stops trusting it at once
      try {
        await fetch(`${config.url}/auth/v1/logout`, {
          method: 'POST',
          headers: { apikey: config.key, authorization: `Bearer ${token}` },
        })
      } catch {
        // signed out locally either way
      }
    }
    return json(200, { signed_out: true })
  }

  return json(400, { error: 'bad_request' })
}
