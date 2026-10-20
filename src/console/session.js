// The console's sign in, in the browser. Holds only the session Supabase
// issued after the magic link was opened; every read is checked again on
// the server (api/_lib/console-auth.js). No Supabase key lives here.

import { setExcluded } from '../lib/analytics'
import { readJson, removeStore, writeStore } from '../lib/analytics/storage'

const KEY = 'lc_console'
export const SIGNED_OUT_EVENT = 'lc-console-signed-out'

// A session that just arrived by link is not trusted until the server has
// accepted it once. Only then is this browser marked as Logan's, so a
// crafted link cannot quietly switch off tracking for a visitor.
let excludeOnFirstRead = false

export class ConsoleError extends Error {
  constructor(status, code) {
    super(code || `status ${status}`)
    this.status = status
    this.code = code
  }
}

export const readSession = () => {
  const s = readJson(KEY)
  return s?.access_token && s?.refresh_token ? s : null
}
const saveSession = (s) => writeStore(KEY, JSON.stringify(s))

function signedOut() {
  removeStore(KEY)
  window.dispatchEvent(new Event(SIGNED_OUT_EVENT))
}

// The magic link lands on /console#access_token=…&refresh_token=… (or
// #error=…). Take the session, then wipe it from the address bar so it is
// not left in history.
export function takeSessionFromUrl() {
  const hash = window.location.hash.slice(1)
  if (!hash) return {}
  const p = new URLSearchParams(hash)
  const clear = () => window.history.replaceState(null, '', window.location.pathname + window.location.search)
  if (p.get('error') || p.get('error_code')) {
    clear()
    return { error: p.get('error_code') || p.get('error') }
  }
  const access = p.get('access_token')
  const refresh = p.get('refresh_token')
  if (!access || !refresh) return {}
  const expiresAt = Number(p.get('expires_at')) || Math.floor(Date.now() / 1000) + (Number(p.get('expires_in')) || 3600)
  saveSession({ access_token: access, refresh_token: refresh, expires_at: expiresAt })
  excludeOnFirstRead = true
  clear()
  return { signedIn: true }
}

async function post(body, token) {
  const headers = { 'content-type': 'application/json' }
  if (token) headers.authorization = `Bearer ${token}`
  return fetch('/api/console/auth', { method: 'POST', headers, body: JSON.stringify(body) })
}

export async function sendLink(email) {
  const res = await post({ action: 'login', email })
  if (res.ok) return
  const body = await res.json().catch(() => ({}))
  throw new ConsoleError(res.status, body.error)
}

export async function signOut() {
  const s = readSession()
  try {
    if (s) await post({ action: 'logout' }, s.access_token)
  } catch {
    // signed out here either way
  } finally {
    signedOut()
  }
}

// One refresh at a time, shared by every read waiting on it. Resolves to
// { session }, { refused } when the refresh token is no good, or
// { unreachable } when the server or Supabase could not answer. Only a
// refusal ends the session; an outage keeps it for the next try.
let refreshing = null
function refresh(s) {
  refreshing ??= (async () => {
    try {
      const res = await post({ action: 'refresh', refresh_token: s.refresh_token })
      if (res.status === 401) return { refused: true }
      if (!res.ok) return { unreachable: true }
      const next = await res.json()
      saveSession(next)
      return { session: next }
    } catch {
      return { unreachable: true }
    } finally {
      refreshing = null
    }
  })()
  return refreshing
}

// A read from api/console/data. Refreshes a session that is about to
// expire, retries once on 401, and signs out only when Supabase has
// refused the session.
export async function readView(params) {
  let s = readSession()
  if (!s) {
    signedOut()
    throw new ConsoleError(401, 'signed_out')
  }
  if (s.expires_at * 1000 - Date.now() < 60_000) {
    const r = await refresh(s)
    if (r.session) s = r.session
    else if (r.refused) {
      signedOut()
      throw new ConsoleError(401, 'signed_out')
    }
  }

  const call = (session) =>
    fetch(`/api/console/data?${new URLSearchParams(params)}`, {
      headers: { authorization: `Bearer ${session.access_token}` },
      cache: 'no-store',
    })

  let res = await call(s)
  if (res.status === 401) {
    const r = await refresh(s)
    if (r.refused) {
      signedOut()
      throw new ConsoleError(401, 'signed_out')
    }
    if (r.unreachable) throw new ConsoleError(502, 'auth_unreachable')
    res = await call(r.session)
    if (res.status === 401) {
      signedOut()
      throw new ConsoleError(401, 'signed_out')
    }
  }
  const body = await res.json().catch(() => null)
  if (!res.ok || !body) throw new ConsoleError(res.status, body?.error)
  if (excludeOnFirstRead) {
    excludeOnFirstRead = false
    setExcluded(true)
  }
  return body
}
