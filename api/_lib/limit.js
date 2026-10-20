// A best effort brake on one address hammering an endpoint. Per function
// instance only: Vercel runs several and recycles them, so this slows a
// loop from one machine, it does not stop a determined sender. The real
// limit is a Vercel Firewall rate limit rule (README).
//
// The address is held in memory for one window, as a map key, and never
// stored, logged or sent anywhere.

const MAX_TRACKED = 5000

export function createLimiter({ max, windowMs }) {
  const hits = new Map() // address → { start, count }
  return function overLimit(address, now) {
    if (!address) return false
    if (hits.size > MAX_TRACKED) {
      for (const [key, h] of hits) if (now - h.start > windowMs) hits.delete(key)
      if (hits.size > MAX_TRACKED) hits.clear()
    }
    const h = hits.get(address)
    if (!h || now - h.start > windowMs) {
      hits.set(address, { start: now, count: 1 })
      return false
    }
    h.count += 1
    return h.count > max
  }
}
