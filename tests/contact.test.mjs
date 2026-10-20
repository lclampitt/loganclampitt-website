import { afterEach, beforeEach, test } from 'node:test'
import assert from 'node:assert/strict'
import { POST } from '../api/contact.js'

const SITE = 'https://loganclampitt.com'
const realFetch = globalThis.fetch
const realEnv = { ...process.env }
let rows
const good = () => ({
  message_id: crypto.randomUUID(),
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  message: 'Hello,\nlovely site.',
  visitor_id: '6f1c2f7e-1d1a-4c1b-8a0e-2b7a9c3d4e5f',
  session_id: 'a2c4e6f8-1b3d-4f5a-9c7e-0d2f4a6b8c0e',
  page: '/',
})
const send = (body, headers = {}) =>
  POST(
    new Request(`${SITE}/api/contact`, {
      method: 'POST',
      headers: { host: 'loganclampitt.com', origin: SITE, 'x-real-ip': `198.51.100.${Math.floor(Math.random() * 250)}`, ...headers },
      body: JSON.stringify(body),
    }),
  )

beforeEach(() => {
  rows = []
  process.env.SUPABASE_URL = 'https://example.supabase.co'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'sb_secret_test'
  process.env.VERCEL_ENV = 'production'
  globalThis.fetch = async (url, init) => {
    assert.match(String(url), /\/rest\/v1\/contact_messages\?on_conflict=message_id/)
    rows.push(JSON.parse(init.body))
    return new Response(null, { status: 201 })
  }
})
afterEach(() => {
  globalThis.fetch = realFetch
  process.env = { ...realEnv }
})

test('a message is kept with its visit, in its own table', async () => {
  const res = await send(good())
  assert.equal(res.status, 202)
  assert.equal(rows.length, 1)
  assert.equal(rows[0].name, 'Ada Lovelace')
  assert.equal(rows[0].message, 'Hello,\nlovely site.')
  assert.equal(rows[0].visitor_id, '6f1c2f7e-1d1a-4c1b-8a0e-2b7a9c3d4e5f')
  assert.equal(rows[0].site_env, 'production')
})

test('Global Privacy Control keeps the message but not the link to the visit', async () => {
  await send(good(), { 'sec-gpc': '1' })
  assert.equal(rows[0].visitor_id, null)
  assert.equal(rows[0].session_id, null)
})

test('bad or oversized fields are refused, and nothing is stored', async () => {
  assert.equal((await send({ ...good(), email: 'not an email' })).status, 422)
  assert.equal((await send({ ...good(), name: '' })).status, 422)
  assert.equal((await send({ ...good(), message: 'x'.repeat(5001) })).status, 422)
  assert.equal((await send({ ...good(), message_id: 'nope' })).status, 422)
  assert.equal(rows.length, 0)
})

test('control characters are stripped; a bad page is dropped, not refused', async () => {
  await send({ ...good(), name: 'Ada\u0000 Lovelace', page: '/<b>' })
  assert.equal(rows[0].name, 'Ada Lovelace')
  assert.equal(rows[0].page, null)
})

test('only this site may post, and one address is slowed down', async () => {
  assert.equal((await send(good(), { origin: 'https://evil.example' })).status, 403)
  const statuses = []
  for (let i = 0; i < 7; i++) statuses.push((await send(good(), { 'x-real-ip': '203.0.113.77' })).status)
  assert.equal(statuses[0], 202)
  assert.equal(statuses.at(-1), 429)
})

test('a database error never echoes the message', async () => {
  globalThis.fetch = async () => new Response('Failing row contains (Ada, secret words)', { status: 400 })
  const res = await send(good())
  assert.equal(res.status, 502)
  assert.doesNotMatch(await res.text(), /secret words/)
})

test('a filled honeypot gets the normal answer and stores nothing', async () => {
  const res = await send({ ...good(), website: 'http://spam.example' })
  assert.equal(res.status, 202)
  assert.equal(rows.length, 0)
})

test('an address that could add a Bcc or subject to a reply is refused', async () => {
  for (const email of ['x@a.co?bcc=evil%40e.org', 'x@a.co,other@e.org', 'x@a.co#frag', 'x y@a.co']) {
    assert.equal((await send({ ...good(), email })).status, 422, email)
  }
  assert.equal((await send({ ...good(), email: 'ada@localhost' })).status, 202)
})

test('a half emoji from the length cut is repaired, not refused', async () => {
  await send({ ...good(), message: 'Thanks \ud83d' })
  assert.equal(rows[0].message, 'Thanks \ufffd')
})
