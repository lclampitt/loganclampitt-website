// Is this address a rented server? Asked once per batch with the
// connecting address; only the yes or no is kept. The address itself is
// never stored or logged. (Files under api/_lib are helpers, not routes.)
//
// Three answers: true (inside a published cloud block), false (a
// parseable address outside every block), null (no address, or one that
// cannot be parsed). Null never votes.

import { V4_RANGES, V6_RANGES } from './datacenter-ranges.js'

function decode32(s) {
  const out = new Uint32Array(s.length / 8)
  for (let i = 0; i < out.length; i++) out[i] = parseInt(s.slice(i * 8, i * 8 + 8), 16)
  return out
}
function decode64(s) {
  const out = new BigUint64Array(s.length / 16)
  for (let i = 0; i < out.length; i++) out[i] = BigInt('0x' + s.slice(i * 16, i * 16 + 16))
  return out
}

// Decoded on first use, then kept for the life of the function instance.
let v4 = null
let v6 = null

// Pairs of [start, end], sorted and non-overlapping: binary search for the
// last start at or below the value, then check its end.
function inRanges(pairs, value) {
  let lo = 0
  let hi = pairs.length / 2 - 1
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    const start = pairs[mid * 2]
    const end = pairs[mid * 2 + 1]
    if (value < start) hi = mid - 1
    else if (value > end) lo = mid + 1
    else return true
  }
  return false
}

export function parseV4(addr) {
  const p = addr.split('.')
  if (p.length !== 4) return null
  let n = 0
  for (const part of p) {
    if (!/^\d{1,3}$/.test(part)) return null
    const v = Number(part)
    if (v > 255) return null
    n = n * 256 + v
  }
  return n
}

// The network half of an IPv6 address: its first 64 bits.
export function parseV6Network(addr) {
  if (!/^[0-9a-f:]+$/i.test(addr) || addr.split('::').length > 2) return null
  const [head, tail] = addr.split('::')
  const h = head ? head.split(':') : []
  const t = tail ? tail.split(':') : []
  const missing = 8 - h.length - t.length
  if (addr.includes('::') && missing < 1) return null
  const groups = addr.includes('::') ? [...h, ...Array(missing).fill('0'), ...t] : h
  if (groups.length !== 8 || groups.some((g) => g.length > 4)) return null
  let hi = 0n
  for (const g of groups.slice(0, 4)) hi = (hi << 16n) | BigInt(parseInt(g || '0', 16))
  return hi
}

export function isDatacenterIp(raw) {
  const addr = (raw ?? '').trim()
  if (!addr) return null
  // An IPv4 address carried inside IPv6 (::ffff:1.2.3.4) is judged as IPv4.
  const mapped = addr.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i)
  const four = parseV4(mapped ? mapped[1] : addr)
  if (four !== null) {
    v4 ??= decode32(V4_RANGES)
    return inRanges(v4, four)
  }
  const six = parseV6Network(addr)
  if (six !== null) {
    v6 ??= decode64(V6_RANGES)
    return inRanges(v6, six)
  }
  return null
}

// The connecting address as Vercel's edge reports it. x-real-ip first;
// x-forwarded-for's FIRST entry is the client, later ones are proxies.
export function connectingIp(headers) {
  const real = headers.get('x-real-ip')?.trim()
  if (real) return real
  const first = headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  return first || null
}
