import { afterEach, beforeEach, test } from 'node:test'
import assert from 'node:assert/strict'
import { POST as auth } from '../api/console/auth.js'
import { GET as data } from '../api/console/data.js'

const SITE = 'https://loganclampitt.com'
const PASSWORD = 'correct horse battery staple'
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
    if (u.includes('grant_type=password')) {
      const body = JSON.parse(init.body)
      return body.password === PASSWORD
        ? new Response(JSON.stringify({ access_token: 'a', refresh_token: 'r', expires_in: 3600, user: { email: body.email } }))
        : new Response('{"error":"invalid_grant"}', { status: 400 })
    }
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
const post = (body, headers = {}) =>
  auth(
    new Request(`${SITE}/api/console/auth`, {
      method: 'POST',
      headers: { host: 'loganclampitt.com', origin: SITE, 'x-real-ip': `198.51.100.${Math.floor(Math.random() * 200)}`, ...headers },
      body: JSON.stringify(body),
    }),
  )
const login = (email, password, headers) => post({ action: 'login', email, password }, headers)

test('no token, a bad token or someone else is refused before any read', async () => {
  assert.equal((await read('view=overview&days=7')).status, 401)
  assert.equal((await read('view=overview&days=7', 'forged')).status, 401)
  assert.equal((await read('view=overview&days=7', 'other-token')).status, 401)
  assert.equal(calls.some((c) => c.url.includes('/rest/v1/rpc/')), false)
})

test("Logan's session reads production data through the SQL function", async () => {
  const res = await read('view=overview&days=7', 'good-token')
  assert.equal(res.status, 200)
  assert.equal((await res.json()).env, 'production')
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
  assert.equal((await read('view=visitors&offset=abc', 'good-token')).status, 400)
  rpcResult = null
  assert.equal((await read('view=visitor&n=5', 'good-token')).status, 404)
})

test('not configured names what is missing, never a value', async () => {
  delete process.env.CONSOLE_EMAIL
  delete process.env.SUPABASE_SERVICE_ROLE_KEY
  const res = await read('view=overview&days=7', 'good-token')
  assert.equal(res.status, 503)
  assert.deepEqual(await res.json(), { error: 'not_configured', missing: ['SUPABASE_SERVICE_ROLE_KEY', 'CONSOLE_EMAIL'] })
})

test('the Supabase URL may come from the integration name', async () => {
  delete process.env.SUPABASE_URL
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
  assert.equal((await read('view=overview&days=7', 'good-token')).status, 200)
})

test('the right email and password sign in; the session comes back', async () => {
  const res = await login(' LOGAN@example.com ', PASSWORD)
  assert.equal(res.status, 200)
  const body = await res.json()
  assert.equal(body.access_token, 'a')
  assert.equal(body.refresh_token, 'r')
  const grant = calls.find((c) => c.url.includes('grant_type=password'))
  assert.deepEqual(JSON.parse(grant.init.body), { email: 'logan@example.com', password: PASSWORD })
})

test('a wrong password and a wrong email get the same answer', async () => {
  const wrongPassword = await login('logan@example.com', 'nope')
  const wrongEmail = await login('someone@else.com', PASSWORD)
  assert.equal(wrongPassword.status, 401)
  assert.equal(wrongEmail.status, 401)
  assert.deepEqual(await wrongPassword.json(), await wrongEmail.json())
  // someone else's address never reaches Supabase at all
  assert.equal(calls.filter((c) => c.url.includes('grant_type=password')).length, 1)
  assert.equal((await login('logan@example.com', '')).status, 401)
})

test('one address guessing passwords is slowed down', async () => {
  const statuses = []
  for (let i = 0; i < 12; i++) statuses.push((await login('logan@example.com', 'guess', { 'x-real-ip': '203.0.113.50' })).status)
  assert.equal(statuses[0], 401)
  assert.equal(statuses.at(-1), 429)
})

test('sign in refuses another origin', async () => {
  assert.equal((await login('logan@example.com', PASSWORD, { origin: 'https://evil.example' })).status, 403)
})

test('a Supabase Auth outage is a 502, not a sign out', async () => {
  const real = globalThis.fetch
  globalThis.fetch = async (url, init) =>
    String(url).endsWith('/auth/v1/user') ? new Response('upstream', { status: 503 }) : real(url, init)
  assert.equal((await read('view=overview&days=7', 'outage-token')).status, 502)
  globalThis.fetch = async (url, init) =>
    String(url).includes('grant_type=password') ? new Response('upstream', { status: 500 }) : real(url, init)
  assert.equal((await login('logan@example.com', PASSWORD)).status, 502)
})

test('a refresh refused by Supabase signs out; a Supabase failure does not', async () => {
  const real = globalThis.fetch
  globalThis.fetch = async (url, init) =>
    String(url).includes('grant_type=refresh_token') ? new Response('{}', { status: 400 }) : real(url, init)
  assert.equal((await post({ action: 'refresh', refresh_token: 'r1' }, { 'x-real-ip': '192.0.2.77' })).status, 401)
  globalThis.fetch = async (url, init) =>
    String(url).includes('grant_type=refresh_token') ? new Response('{}', { status: 500 }) : real(url, init)
  assert.equal((await post({ action: 'refresh', refresh_token: 'r1' }, { 'x-real-ip': '192.0.2.77' })).status, 502)
})
