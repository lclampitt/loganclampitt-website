// A best effort brake on one address flooding /api/events. Per function
// instance only: Vercel runs several and recycles them, so this slows a
// loop from one machine, it does not stop a determined sender. The real
// limit is a Vercel Firewall rate limit rule on /api/events (README).
//
// The address is held in memory for at most a minute, as a map key, and
// never stored, logged or sent anywhere.

const WINDOW_MS = 60_000
// A busy real visitor sends a batch every few seconds at most.
const MAX_BATCHES_PER_WINDOW = 30
const MAX_TRACKED = 5000

const hits = new Map() // address → { start, count }

export function overLimit(address, now) {
  if (!address) return false
  if (hits.size > MAX_TRACKED) {
    for (const [key, h] of hits) if (now - h.start > WINDOW_MS) hits.delete(key)
    if (hits.size > MAX_TRACKED) hits.clear()
  }
  const h = hits.get(address)
  if (!h || now - h.start > WINDOW_MS) {
    hits.set(address, { start: now, count: 1 })
    return false
  }
  h.count += 1
  return h.count > MAX_BATCHES_PER_WINDOW
}
