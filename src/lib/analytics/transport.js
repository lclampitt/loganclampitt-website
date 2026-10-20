// Batches events to /api/events. Events wait up to five seconds (or until
// ten are queued), then go in one request. When the page is hidden or
// closed whatever is left goes with sendBeacon, which the browser
// delivers even as the page unloads.
//
// A refusal (400, 403, 413, 422) or a site with tracking not configured
// (503) is permanent: the batch is dropped, not retried forever. A network
// failure or a 5xx is retried with backoff, a few times at most.

import { MAX_BATCH } from '../../../shared/events.js'

const ENDPOINT = '/api/events'
const FLUSH_DELAY_MS = 5000
const FLUSH_AT = 10
const MAX_QUEUE = 200
const MAX_ATTEMPTS = 5

let queue = []
let timer = 0
let attempts = 0
let backoffUntil = 0
let sending = false

const PERMANENT = new Set([400, 403, 404, 405, 413, 422, 503])

function payload(events) {
  return JSON.stringify({
    events,
    viewport_width: Math.round(window.innerWidth) || null,
    viewport_height: Math.round(window.innerHeight) || null,
    // Automation (Selenium, Puppeteer, Playwright) sets this. It can only
    // ever mark a visit as a crawler, never clear one.
    automation: navigator.webdriver === true,
  })
}

function schedule(delay = FLUSH_DELAY_MS) {
  if (timer) return
  timer = window.setTimeout(() => {
    timer = 0
    flush()
  }, delay)
}

export function enqueue(event) {
  queue.push(event)
  if (queue.length > MAX_QUEUE) queue = queue.slice(-MAX_QUEUE) // oldest go first
  if (queue.length >= FLUSH_AT) flush()
  else schedule()
}

export function clearQueue() {
  queue = []
  window.clearTimeout(timer)
  timer = 0
}

// Take these events out of the queue by id, not by count: while a request
// is in flight the page may hide (flushOnExit empties the queue) and new
// events may arrive, so the front of the queue is not always this batch.
function remove(batch) {
  const ids = new Set(batch.map((e) => e.event_id))
  queue = queue.filter((e) => !ids.has(e.event_id))
}

export async function flush() {
  if (sending || queue.length === 0) return
  const wait = backoffUntil - Date.now()
  if (wait > 0) {
    schedule(wait) // a timer that fired early must not strand the queue
    return
  }
  const batch = queue.slice(0, MAX_BATCH)
  sending = true
  let outcome = 'retry'
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: payload(batch),
      keepalive: true,
    })
    outcome = res.ok ? 'sent' : PERMANENT.has(res.status) ? 'drop' : 'retry'
  } catch {
    outcome = 'retry'
  } finally {
    sending = false
  }

  if (outcome === 'retry' && attempts + 1 < MAX_ATTEMPTS) {
    attempts += 1
    const delay = Math.min(30_000, 1000 * 2 ** attempts)
    backoffUntil = Date.now() + delay
    window.clearTimeout(timer) // replace any shorter timer set meanwhile
    timer = 0
    schedule(delay)
    return
  }
  // Sent, refused for good, or out of retries: this batch is done.
  attempts = 0
  backoffUntil = 0
  remove(batch)
  if (queue.length) schedule(0)
}

// Page hidden or closing: hand everything left to the browser.
export function flushOnExit() {
  window.clearTimeout(timer)
  timer = 0
  while (queue.length) {
    const batch = queue.slice(0, MAX_BATCH)
    const body = payload(batch)
    let handed = false
    try {
      handed = navigator.sendBeacon?.(ENDPOINT, new Blob([body], { type: 'application/json' })) === true
    } catch {
      handed = false
    }
    if (!handed) {
      try {
        fetch(ENDPOINT, { method: 'POST', headers: { 'content-type': 'application/json' }, body, keepalive: true }).catch(
          () => {},
        )
      } catch {
        // the page is going away; nothing more to try
      }
    }
    remove(batch)
  }
}
