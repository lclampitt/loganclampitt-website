import { afterEach, beforeEach, test } from 'node:test'
import assert from 'node:assert/strict'
import { POST } from '../api/events.js'
import { MAX_BODY_BYTES } from '../shared/events.js'

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36'
const goodEvent = {
  event_id: '0b6b7a8e-6a51-4d0e-9a52-1f0f5f0c2a11',
  event_name: 'Page_Viewed',
  occurred_at: new Date().toISOString(),
  visitor_id: '6f1c2f7e-1d1a-4c1b-8a0e-2b7a9c3d4e5f',
  identity_source: 'persistent',
  session_id: null,
  page: '/',
}

const post = (body, headers = {}) =>
  POST(
    new Request('https://loganclampitt.com/api/events', {
      method: 'POST',
      headers: { host: 'loganclampitt.com', origin: 'https://loganclampitt.com', 'user-agent': UA, ...headers },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    }),
  )

let calls
const realFetch = globalThis.fetch
const realEnv = { ...process.env }

beforeEach(() => {
  calls = []
  process.env.SUPABASE_URL = 'https://example.supabase.co'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'sb_secret_test'
  process.env.VERCEL_ENV = 'preview'
  globalThis.fetch = async (url, init) => {
    calls.push({ url, init })
    const rows = JSON.parse(init.body)
    return new Response(JSON.stringify(rows.map((r) => ({ event_id: r.event_id }))), { status: 201 })
  }
})
afterEach(() => {
  globalThis.fetch = realFetch
  process.env = { ...realEnv }
})

test('stores a good batch with the secret key in the apikey header only', async () => {
  const res = await post({ events: [goodEvent] })
  assert.equal(res.status, 202)
  assert.deepEqual(await res.json(), { received: 1, stored: 1 })
  assert.equal(calls.length, 1)
  assert.match(calls[0].url, /\/rest\/v1\/events\?on_conflict=event_id/)
  assert.equal(calls[0].init.headers.apikey, 'sb_secret_test')
  assert.equal(calls[0].init.headers.authorization, undefined)
  assert.match(calls[0].init.headers.prefer, /resolution=ignore-duplicates/)
  const [row] = JSON.parse(calls[0].init.body)
  assert.equal(row.site_env, 'preview')
  assert.equal('ip' in row || 'user_agent' in row, false)
})

test('refuses an oversized body before parsing it', async () => {
  const res = await post('x'.repeat(MAX_BODY_BYTES + 1))
  assert.equal(res.status, 413)
  assert.equal(calls.length, 0)
})

test('refuses another site posting here', async () => {
  const res = await post({ events: [goodEvent] }, { origin: 'https://evil.example' })
  assert.equal(res.status, 403)
  assert.equal(calls.length, 0)
})

test('refuses bad json and invalid events without touching the database', async () => {
  assert.equal((await post('{nope')).status, 400)
  assert.equal((await post({ events: [{ ...goodEvent, event_name: 'Nope' }] })).status, 422)
  assert.equal(calls.length, 0)
})

test('says not configured instead of pretending when the key is missing', async () => {
  delete process.env.SUPABASE_SERVICE_ROLE_KEY
  const res = await post({ events: [goodEvent] })
  assert.equal(res.status, 503)
})

test('a database error is a 502 and never echoes its text', async () => {
  globalThis.fetch = async () => new Response('Failing row contains (secret stuff)', { status: 400 })
  const res = await post({ events: [goodEvent] })
  assert.equal(res.status, 502)
  assert.doesNotMatch(JSON.stringify(await res.json()), /secret stuff/)
})

test('a batch with no Origin passes only when the browser marks it same origin', async () => {
  const bare = (headers) =>
    POST(new Request('https://loganclampitt.com/api/events', { method: 'POST', headers: { 'user-agent': UA, ...headers }, body: JSON.stringify({ events: [goodEvent] }) }))
  assert.equal((await bare({})).status, 403)
  assert.equal((await bare({ 'sec-fetch-site': 'same-origin' })).status, 202)
})

test('Global Privacy Control in the header means nothing is stored', async () => {
  const res = await post({ events: [goodEvent] }, { 'sec-gpc': '1' })
  assert.equal(res.status, 202)
  assert.deepEqual(await res.json(), { received: 0, stored: 0 })
  assert.equal(calls.length, 0)
})

test('one address sending batch after batch is slowed down', async () => {
  const statuses = []
  for (let i = 0; i < 32; i++) statuses.push((await post({ events: [goodEvent] }, { 'x-real-ip': '203.0.113.9' })).status)
  assert.equal(statuses[0], 202)
  assert.equal(statuses.at(-1), 429)
})
