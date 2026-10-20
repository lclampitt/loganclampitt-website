// Who and which visit, kept in localStorage only. No cookies.
//
// visitor id: a random uuid, minted once per browser. If it cannot be
//   stored it lives only for this page load and is sent as 'ephemeral',
//   which the console never counts as a person.
// session: a new one after 30 minutes idle, or on arrival from outside.
// first and last touch: the channel of the first arrival, and of the
//   latest arrival from outside. If they cannot be stored they are sent
//   as null (not measured), never as 'direct'.

import { classifyArrival } from './channel'
import { readJson, readStore, removeStore, uuid, writeStore } from './storage'

const VISITOR_KEY = 'lc_vid'
const SESSION_KEY = 'lc_ses'
const ATTRIBUTION_KEY = 'lc_attr'
export const SESSION_TIMEOUT_MS = 30 * 60 * 1000

let visitor = null // { id, source }
let session = null // { id, last }
let attribution = null // { ft, lt } or null when not measured
let arrivalExternal = false

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// A stored id that is not a uuid would make the server refuse every batch,
// so it is replaced rather than trusted.
function loadVisitor() {
  const stored = readStore(VISITOR_KEY)
  if (stored && UUID.test(stored)) return { id: stored, source: 'persistent' }
  const id = uuid()
  return { id, source: writeStore(VISITOR_KEY, id) ? 'persistent' : 'ephemeral' }
}

function navigationType() {
  try {
    return performance.getEntriesByType('navigation')[0]?.type ?? 'navigate'
  } catch {
    return 'navigate'
  }
}

function loadAttribution() {
  const arrival = classifyArrival(window.location.href, document.referrer, window.location.hostname, {
    navType: navigationType(),
    userAgent: navigator.userAgent,
  })
  arrivalExternal = arrival.external
  const touch = { ch: arrival.channel, src: arrival.source, ts: new Date().toISOString() }
  const saved = readJson(ATTRIBUTION_KEY)
  const next = {
    ft: saved?.ft ?? touch,
    lt: arrival.external || !saved?.lt ? touch : saved.lt,
  }
  return writeStore(ATTRIBUTION_KEY, JSON.stringify(next)) ? next : null
}

// Called once, on the first event of the page load.
export function startIdentity() {
  if (visitor) return
  visitor = loadVisitor()
  attribution = loadAttribution()
}

// The session for an event at `at`, rolling it over when it has gone idle
// or this page load arrived from outside.
export function sessionFor(at) {
  // Another tab may have moved the session on; the newest one wins, so a
  // tab left open for an hour does not split an active visit.
  const stored = readJson(SESSION_KEY)
  if (stored?.id && stored.last > (session?.last ?? 0)) session = stored
  const stale = !session?.id || at - (session.last ?? 0) > SESSION_TIMEOUT_MS
  if (stale || arrivalExternal) {
    session = { id: uuid(), last: at }
    arrivalExternal = false
  } else {
    session = { ...session, last: at }
  }
  writeStore(SESSION_KEY, JSON.stringify(session))
  return session.id
}

export function identityFields() {
  return {
    visitor_id: visitor.id,
    identity_source: visitor.source,
    ft_channel: attribution?.ft?.ch ?? null,
    ft_source: attribution?.ft?.src ?? null,
    lt_channel: attribution?.lt?.ch ?? null,
    lt_source: attribution?.lt?.src ?? null,
  }
}

// Turning tracking off on this browser forgets everything it remembered.
export function forgetIdentity() {
  for (const key of [VISITOR_KEY, SESSION_KEY, ATTRIBUTION_KEY]) removeStore(key)
  visitor = null
  session = null
  attribution = null
}
