import { afterEach, beforeEach, test } from 'node:test'
import assert from 'node:assert/strict'
import { POST as auth } from '../api/console/auth.js'
import { GET as data } from '../api/console/data.js'

const SITE = 'https://loganclampitt.com'
const realFetch = globalThis.fetch
const realEnv = { ...process.env }
let calls
let users // access token → user returned by /auth/v1/user
let rpcResult

beforeEach(() => {
  calls = []
  users = {
    'good-token': { email: 'Logan@Example.com', email_confirmed_at: '2026-10-20T00:00:00Z' },
    'other-token': { email: 'someone@else.com', email_confirmed_at: '2026-10-20T00:00:00Z' },
  }
  rpcResult = { ok: true }
  process.env.SUPABASE_URL = 'https://example.supabase.co'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'sb_secret_test'
  process.env.CONSOLE_EMAIL = 'logan@example.com'
  process.env.VERCEL_ENV = 'production'
  globalThis.fetch = async (url, init = {}) => {
    calls.push({ url: String(url), init })
    const u = String(url)
    if (u.endsWith('/auth/v1/user')) {
      const token = init.headers.authorization.replace('Bearer ', '')
      return users[token] ? new Response(JSON.stringify(users[token])) : new Response('{}', { status: 401 })
    }
    if (u.includes('/auth/v1/otp')) return new Response('{}', { status: 200 })
    if (u.includes('/rest/v1/rpc/')) return new Response(JSON.stringify(rpcResult))
    return new Response('{}', { status: 404 })
  }
})
afterEach(() => {
  globalThis.fetch = realFetch
  process.env = { ...realEnv }
})

const read = (query, token) =>
  data(new Request(`${SITE}/api/console/data?${query}`, { headers: token ? { authorization: `Bearer ${token}` } : {} }))
const login = (email, headers = {}) =>
  auth(
    new Request(`${SITE}/api/console/auth`, {
      method: 'POST',
      headers: { host: 'loganclampitt.com', origin: SITE, 'x-real-ip': `198.51.100.${Math.floor(Math.random() * 200)}`, ...headers },
      body: JSON.stringify({ action: 'login', email }),
    }),
  )

test('no token, a bad token or someone else is refused before any read', async () => {
  assert.equal((await read('view=overview&days=7')).status, 401)
  assert.equal((await read('view=overview&days=7', 'forged')).status, 401)
  assert.equal((await read('view=overview&days=7', 'other-token')).status, 401)
  assert.equal(calls.some((c) => c.url.includes('/rest/v1/rpc/')), false)
})

test("Logan's session reads production data through the SQL function", async () => {
  const res = await read('view=overview&days=7', 'good-token')
  assert.equal(res.status, 200)
  const body = await res.json()
  assert.equal(body.env, 'production')
  const rpc = calls.find((c) => c.url.includes('/rest/v1/rpc/console_overview'))
  assert.deepEqual(JSON.parse(rpc.init.body), { p_env: 'production', p_days: 7 })
})

test('a preview reads its own preview data only', async () => {
  process.env.VERCEL_ENV = 'preview'
  await read('view=behaviour&days=all', 'good-token')
  const rpc = calls.find((c) => c.url.includes('/rest/v1/rpc/console_behaviour'))
  assert.deepEqual(JSON.parse(rpc.init.body), { p_env: 'preview', p_days: null })
})

test('bad parameters and a missing visitor are honest errors', async () => {
  assert.equal((await read('view=overview&days=9', 'good-token')).status, 400)
  assert.equal((await read('view=nope', 'good-token')).status, 400)
  assert.equal((await read('view=visitor&n=abc', 'good-token')).status, 400)
  rpcResult = null
  assert.equal((await read('view=visitor&n=5', 'good-token')).status, 404)
})

test('says not configured when the console email is not set', async () => {
  delete process.env.CONSOLE_EMAIL
  assert.equal((await read('view=overview&days=7', 'good-token')).status, 503)
})

test('a magic link goes only to the console email, and the answer does not tell', async () => {
  const wrong = await login('someone@else.com')
  assert.equal(wrong.status, 202)
  assert.equal(calls.some((c) => c.url.includes('/auth/v1/otp')), false)

  const right = await login(' LOGAN@example.com ')
  assert.equal(right.status, 202)
  const otp = calls.find((c) => c.url.includes('/auth/v1/otp'))
  assert.match(otp.url, /redirect_to=https%3A%2F%2Floganclampitt\.com%2Fconsole/)
  assert.deepEqual(JSON.parse(otp.init.body), { email: 'logan@example.com', create_user: false })
})

test('sign in refuses another origin', async () => {
  assert.equal((await login('logan@example.com', { origin: 'https://evil.example' })).status, 403)
})

test('a Supabase Auth outage is a 502, not a sign out', async () => {
  const real = globalThis.fetch
  globalThis.fetch = async (url, init) =>
    String(url).endsWith('/auth/v1/user') ? new Response('upstream', { status: 503 }) : real(url, init)
  assert.equal((await read('view=overview&days=7', 'outage-token')).status, 502)
})

test('a refresh refused by Supabase signs out; a Supabase failure does not', async () => {
  const refresh = () =>
    auth(
      new Request(`${SITE}/api/console/auth`, {
        method: 'POST',
        headers: { host: 'loganclampitt.com', origin: SITE, 'x-real-ip': '192.0.2.77' },
        body: JSON.stringify({ action: 'refresh', refresh_token: 'r1' }),
      }),
    )
  const real = globalThis.fetch
  globalThis.fetch = async (url, init) =>
    String(url).includes('grant_type=refresh_token') ? new Response('{}', { status: 400 }) : real(url, init)
  assert.equal((await refresh()).status, 401)
  globalThis.fetch = async (url, init) =>
    String(url).includes('grant_type=refresh_token') ? new Response('{}', { status: 500 }) : real(url, init)
  assert.equal((await refresh()).status, 502)
})

test('a bad offset is refused rather than read as the first page', async () => {
  assert.equal((await read('view=visitors&offset=abc', 'good-token')).status, 400)
  assert.equal((await read('view=visitors', 'good-token')).status, 200)
})
