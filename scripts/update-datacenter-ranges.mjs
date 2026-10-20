#!/usr/bin/env node
// Rebuilds api/_lib/datacenter-ranges.js from the address lists cloud
// providers publish about themselves.
//
// WHY: bots that pose as ordinary browsers pass the user agent check in
// api/events.js. A request that starts inside a rented cloud server is a
// script, not a person at a laptop, so the ingest marks it as a crawler.
// Same approach as pixel-lord's site (2026-10-16), rebuilt here.
//
// SOURCES are the providers' own lists, nothing from third parties.
// Compute only: AWS EC2, Google's cloud.json (customer compute, not
// goog.json), Azure's AzureCloud tag, Oracle, DigitalOcean, Linode.
// Deliberately absent: Cloudflare and Apple Private Relay, whose
// addresses carry real people (WARP, iCloud+).
//
// Run:  node scripts/update-datacenter-ranges.mjs
// Re-run every month or two. A stale list misses new ranges; it never
// flags a person who was not flagged before.

import { writeFileSync } from 'node:fs'

const UA = { 'user-agent': 'Mozilla/5.0 (loganclampitt.com datacenter range refresh)' }

async function text(url) {
  const res = await fetch(url, { headers: UA, redirect: 'follow' })
  if (!res.ok) throw new Error(`${url} → ${res.status}`)
  return res.text()
}
const json = async (url) => JSON.parse(await text(url))

// Microsoft publishes the file under a dated name that changes weekly; the
// download page names the current one.
async function azureUrl() {
  const page = await text('https://www.microsoft.com/en-us/download/confirmation.aspx?id=56519')
  const m = page.match(/https:\/\/download\.microsoft\.com\/download\/[^"' ]*ServiceTags_Public_\d+\.json/)
  if (!m) throw new Error('Azure download link not found on the Microsoft page')
  return m[0]
}

const SOURCES = [
  {
    name: 'AWS EC2',
    load: async () => {
      const d = await json('https://ip-ranges.amazonaws.com/ip-ranges.json')
      return [
        ...d.prefixes.filter((p) => p.service === 'EC2').map((p) => p.ip_prefix),
        ...d.ipv6_prefixes.filter((p) => p.service === 'EC2').map((p) => p.ipv6_prefix),
      ]
    },
  },
  {
    name: 'Google Cloud',
    load: async () =>
      (await json('https://www.gstatic.com/ipranges/cloud.json')).prefixes.map((p) => p.ipv4Prefix ?? p.ipv6Prefix),
  },
  {
    name: 'Azure',
    load: async () => {
      const d = await json(await azureUrl())
      const tag = d.values.find((v) => v.name === 'AzureCloud')
      if (!tag) throw new Error('AzureCloud tag missing')
      return tag.properties.addressPrefixes
    },
  },
  {
    name: 'Oracle Cloud',
    load: async () =>
      (await json('https://docs.oracle.com/en-us/iaas/tools/public_ip_ranges.json')).regions.flatMap((r) =>
        r.cidrs.map((c) => c.cidr),
      ),
  },
  {
    name: 'DigitalOcean',
    load: async () =>
      (await text('https://digitalocean.com/geo/google.csv'))
        .split('\n')
        .map((l) => l.split(',')[0].trim())
        .filter(Boolean),
  },
  {
    name: 'Linode',
    load: async () =>
      (await text('https://geoip.linode.com/'))
        .split('\n')
        .filter((l) => l.trim() && !l.startsWith('#'))
        .map((l) => l.split(',')[0].trim()),
  },
]

// ── CIDR → numeric ranges ───────────────────────────────────────────

function v4(addr) {
  const p = addr.split('.').map(Number)
  if (p.length !== 4 || p.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return null
  return ((p[0] << 24) >>> 0) + (p[1] << 16) + (p[2] << 8) + p[3]
}

// IPv6 is kept to its first 64 bits, the network half. Every provider
// range is /64 or wider except a handful of tiny Azure blocks, which widen
// to their /64: still the provider's own network.
function v6hi(addr) {
  const [head, tail] = addr.split('::')
  const h = head ? head.split(':') : []
  const t = tail !== undefined && tail ? tail.split(':') : []
  const groups = tail === undefined ? h : [...h, ...Array(8 - h.length - t.length).fill('0'), ...t]
  if (groups.length !== 8) return null
  let hi = 0n
  for (const g of groups.slice(0, 4)) hi = (hi << 16n) | BigInt(parseInt(g || '0', 16))
  return hi
}

const MAX64 = (1n << 64n) - 1n

function toRange(cidr) {
  const [addr, lenStr] = cidr.split('/')
  const len = Number(lenStr)
  if (!Number.isInteger(len)) return null
  if (addr.includes(':')) {
    const hi = v6hi(addr)
    if (hi === null) return null
    const bits = BigInt(Math.min(len, 64))
    const mask = bits === 0n ? 0n : (MAX64 << (64n - bits)) & MAX64
    const start = hi & mask
    return { fam: 6, start, end: start | (~mask & MAX64) }
  }
  const n = v4(addr)
  if (n === null || len < 0 || len > 32) return null
  const size = 2 ** (32 - len)
  const start = Math.floor(n / size) * size
  return { fam: 4, start, end: start + size - 1 }
}

function merge(ranges) {
  ranges.sort((a, b) => (a.start < b.start ? -1 : a.start > b.start ? 1 : 0))
  const out = []
  for (const r of ranges) {
    const last = out[out.length - 1]
    const one = typeof r.start === 'bigint' ? 1n : 1
    if (last && r.start <= last.end + one) {
      if (r.end > last.end) last.end = r.end
    } else out.push({ ...r })
  }
  return out
}

const counts = {}
const all = []
for (const s of SOURCES) {
  const cidrs = await s.load()
  const ranges = cidrs.map(toRange).filter(Boolean)
  if (ranges.length < 5) throw new Error(`${s.name}: only ${ranges.length} ranges, refusing to write a thin list`)
  counts[s.name] = ranges.length
  all.push(...ranges)
}

const r4 = merge(all.filter((r) => r.fam === 4))
const r6 = merge(all.filter((r) => r.fam === 6))
const hex = (n, w) => n.toString(16).padStart(w, '0')
const V4 = r4.map((r) => hex(r.start, 8) + hex(r.end, 8)).join('')
const V6 = r6.map((r) => hex(r.start, 16) + hex(r.end, 16)).join('')
const today = new Date().toISOString().slice(0, 10)

writeFileSync(
  new URL('../api/_lib/datacenter-ranges.js', import.meta.url),
  `// GENERATED by scripts/update-datacenter-ranges.mjs on ${today}. Do not edit.
// Cloud providers' own published address lists, merged into sorted,
// non-overlapping ranges: ${Object.entries(counts).map(([k, v]) => `${k} ${v}`).join(', ')}.
// V4: 16 hex chars per range (start, end). V6: first 64 bits only, 32 hex
// chars per range (start, end).

export const DATACENTER_RANGES_UPDATED = '${today}'
export const V4_RANGES = '${V4}'
export const V6_RANGES = '${V6}'
`,
)
console.log(`wrote ${r4.length} IPv4 and ${r6.length} IPv6 ranges`, counts)
