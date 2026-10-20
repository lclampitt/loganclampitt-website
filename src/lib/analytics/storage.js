// localStorage that never throws. Private windows, blocked site data and
// full quotas all make it fail; every caller has to cope with "no".

export function readStore(key) {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

// True only when the value reads back, so a silent failure counts as one.
export function writeStore(key, value) {
  try {
    window.localStorage.setItem(key, value)
    return window.localStorage.getItem(key) === value
  } catch {
    return false
  }
}

export function removeStore(key) {
  try {
    window.localStorage.removeItem(key)
  } catch {
    // nothing stored, nothing to remove
  }
}

export function readJson(key) {
  const raw = readStore(key)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function uuid() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID()
  const b = new Uint8Array(16)
  if (globalThis.crypto?.getRandomValues) crypto.getRandomValues(b)
  else for (let i = 0; i < 16; i++) b[i] = Math.floor(Math.random() * 256)
  b[6] = (b[6] & 0x0f) | 0x40
  b[8] = (b[8] & 0x3f) | 0x80
  const h = [...b].map((x) => x.toString(16).padStart(2, '0')).join('')
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`
}
