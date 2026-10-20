// POST /api/console/auth: sign in to the console with email and password,
// keep the session fresh, and sign out. Everything goes through Supabase
// Auth on the server, so the browser never holds a Supabase key.
//
//   { action: 'login', email, password }  only CONSOLE_EMAIL can sign in
//   { action: 'refresh', refresh_token }   swaps a refresh token for a new session
//   { action: 'logout' } + bearer token    ends the session at Supabase
//
// Logan's user is made by hand in Supabase (Authentication → Users), and
// Supabase sign ups are off, so nobody can create an account. A wrong
// email and a wrong password get the same answer.

import { readCapped } from '../_lib/body.js'
import { connectingIp } from '../_lib/datacenter.js'
import { consoleEmail, forgetToken, sameEmail } from '../_lib/console-auth.js'
import { createLimiter } from '../_lib/limit.js'
import { json, notConfigured, supabaseConfig } from '../_lib/supabase.js'

// Ten tries per ten minutes from one address on one instance. Supabase
// rate limits password sign ins too; a Vercel Firewall rule is the real cap.
const loginLimit = createLimiter({ max: 10, windowMs: 10 * 60_000 })
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

// Supabase's token endpoint, for both grants. Never logs the body: it
// holds the password or a token.
function token(config, grant, body) {
  return fetch(`${config.url}/auth/v1/token?grant_type=${grant}`, {
    method: 'POST',
    headers: { apikey: config.key, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export async function POST(request) {
  if (!sameOrigin(request)) return json(403, { error: 'wrong_origin' })
  const config = supabaseConfig()
  const allowed = consoleEmail()
  if (!config || !allowed) return notConfigured({ console: true })

  const body = await readBody(request)
  if (!body || typeof body.action !== 'string') return json(400, { error: 'bad_request' })
  const address = connectingIp(request.headers)
  const now = Date.now()

  if (body.action === 'login') {
    if (loginLimit(address, now)) return json(429, { error: 'slow_down' })
    const password = typeof body.password === 'string' && body.password.length <= 200 ? body.password : ''
    if (!password || !sameEmail(body.email, allowed)) return json(401, { error: 'wrong_credentials' })
    let res
    try {
      res = await token(config, 'password', { email: allowed, password })
    } catch {
      return json(502, { error: 'auth_unreachable' })
    }
    if (res.status === 400 || res.status === 401) return json(401, { error: 'wrong_credentials' })
    if (res.status === 429) return json(429, { error: 'slow_down' })
    if (!res.ok) {
      console.error(`console auth: sign in failed with ${res.status}`)
      return json(502, { error: 'auth_unreachable' })
    }
    const session = await res.json()
    if (!sameEmail(session.user?.email, allowed)) return json(401, { error: 'wrong_credentials' })
    return json(200, sessionOut(session))
  }

  if (body.action === 'refresh') {
    if (refreshLimit(address, now)) return json(429, { error: 'slow_down' })
    if (typeof body.refresh_token !== 'string' || body.refresh_token.length > 512) return json(401, { error: 'signed_out' })
    let res
    try {
      res = await token(config, 'refresh_token', { refresh_token: body.refresh_token })
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
    const bearer = header.startsWith('Bearer ') ? header.slice(7).trim() : ''
    if (bearer) {
      forgetToken(bearer) // this instance stops trusting it at once
      try {
        await fetch(`${config.url}/auth/v1/logout`, {
          method: 'POST',
          headers: { apikey: config.key, authorization: `Bearer ${bearer}` },
        })
      } catch {
        // signed out locally either way
      }
    }
    return json(200, { signed_out: true })
  }

  return json(400, { error: 'bad_request' })
}
