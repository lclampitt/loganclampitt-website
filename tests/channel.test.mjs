import { test } from 'node:test'
import assert from 'node:assert/strict'
import { classifyArrival } from '../src/lib/analytics/channel.js'

const SITE = 'loganclampitt.com'
const at = (path = '/') => `https://loganclampitt.com${path}`
const arrive = (path, referrer, opts) => classifyArrival(at(path), referrer, SITE, opts)

test('buckets in order', () => {
  assert.deepEqual(arrive('/?gclid=x', 'https://www.google.com/'), { external: true, channel: 'paid', source: 'google' })
  assert.equal(arrive('/', 'https://chatgpt.com/').channel, 'ai')
  assert.equal(arrive('/', 'https://www.google.com/').channel, 'organic_search')
  assert.equal(arrive('/', 'https://www.google.co.uk/').channel, 'organic_search')
  assert.equal(arrive('/', 'https://mail.google.com/').channel, 'email')
  assert.equal(arrive('/', 'https://mail.yahoo.com/').channel, 'email')
  assert.equal(arrive('/', 'https://docs.google.com/').channel, 'referral')
  assert.deepEqual(arrive('/', 'https://www.linkedin.com/feed/'), { external: true, channel: 'social', source: 'linkedin.com' })
  assert.equal(arrive('/?utm_source=newsletter&utm_medium=email', '').channel, 'email')
  assert.deepEqual(arrive('/?utm_source=Resume%20PDF', ''), { external: true, channel: 'campaign', source: 'resume-pdf' })
  assert.deepEqual(arrive('/', 'https://github.com/lclampitt'), { external: true, channel: 'referral', source: 'github.com' })
  assert.deepEqual(arrive('/', ''), { external: false, channel: 'direct', source: null })
})

test('the site itself is never a referrer', () => {
  assert.equal(arrive('/', 'https://www.loganclampitt.com/projects/x').external, false)
  assert.equal(arrive('/', 'https://loganclampitt.com/').channel, 'direct')
})

test('app referrers and the LinkedIn in app browser', () => {
  assert.deepEqual(arrive('/', 'android-app://com.linkedin.android/'), { external: true, channel: 'social', source: 'linkedin.com' })
  assert.deepEqual(arrive('/', 'android-app://com.google.android.gm/'), { external: true, channel: 'email', source: 'gmail' })
  const ios = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [LinkedInApp]'
  assert.deepEqual(arrive('/', '', { userAgent: ios }), { external: true, channel: 'social', source: 'linkedin.com' })
})

test('a reload or back/forward is not a new arrival', () => {
  assert.equal(arrive('/?utm_source=linkedin', 'https://www.linkedin.com/', { navType: 'reload' }).external, false)
  assert.equal(arrive('/', 'https://www.google.com/', { navType: 'back_forward' }).external, false)
})
