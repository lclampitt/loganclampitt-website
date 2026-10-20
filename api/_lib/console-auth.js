// Who may read the console: one person, Logan, signed in with a Supabase
// magic link. Every api/console/* handler calls requireConsole first and
// reads nothing until it says yes.
//
//   CONSOLE_EMAIL  the one address allowed in (server env, never VITE_)
//
// The browser holds only the session Supabase issued after the link was
// opened. It is checked here, against Supabase Auth, on every request; an
// email the browser claims is never trusted.

import { json, supabaseConfig } from './supabase.js'

export const consoleEmail = () => process.env.CONSOLE_EMAIL?.trim().toLowerCase() || null

export const sameEmail = (a, b) => typeof a === 'string' && typeof b === 'string' && a.trim().toLowerCase() === b

// A verified token is remembered for a minute, so a page that makes three
// reads asks Supabase once. Never past the token's own expiry, and
// forgotten at sign out.
const VERIFIED_FOR_MS = 60_000
const verified = new Map() // access token → time the memory ends

// The `exp` claim, read only to bound the cache. Supabase has already
// verified the token by the time this runs; nothing here trusts it.
function tokenExpiry(token) {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'))
    return Number.isFinite(payload.exp) ? payload.exp * 1000 : null
  } catch {
    return null
  }
}

function remember(token, now) {
  if (verified.size > 100) verified.clear()
  const exp = tokenExpiry(token)
  verified.set(token, Math.min(now + VERIFIED_FOR_MS, exp ?? now + VERIFIED_FOR_MS))
}

export const forgetToken = (token) => verified.delete(token)

// The user for a token, null when Supabase says the token is no good
// (401/403). Any other failure throws: an outage at Supabase must not
// look like a signed out session, or Logan loses a good one.
export async function userForToken(config, token) {
  const res = await fetch(`${config.url}/auth/v1/user`, {
    headers: { apikey: config.key, authorization: `Bearer ${token}` },
  })
  if (res.status === 401 || res.status === 403) return null
  if (!res.ok) throw new Error(`auth user check failed with ${res.status}`)
  return res.json()
}

// Returns null when the request may proceed, or the Response to send.
// A refusal never says which check failed.
export async function requireConsole(request) {
  const config = supabaseConfig()
  const allowed = consoleEmail()
  if (!config || !allowed) return json(503, { error: 'not_configured' })

  const header = request.headers.get('authorization') ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : ''
  if (!token || token.length > 4096) return json(401, { error: 'signed_out' })

  const now = Date.now()
  if ((verified.get(token) ?? 0) > now) return null

  let user = null
  try {
    user = await userForToken(config, token)
  } catch {
    return json(502, { error: 'auth_unreachable' })
  }
  if (!user || !sameEmail(user.email, allowed) || !user.email_confirmed_at) {
    return json(401, { error: 'signed_out' })
  }
  remember(token, now)
  return null
}
