// First party visitor tracking for loganclampitt.com.
//
// Nothing is built or sent when the browser sends Global Privacy Control,
// when this browser has been excluded (the switch on /privacy), or on the
// private /console. In those cases no id is ever created either.

import { EVENT_SCHEMA } from '../../../shared/events.js'
import { forgetIdentity, identityFields, sessionFor, startIdentity } from './identity'
import { readStore, uuid, writeStore, removeStore } from './storage'
import { clearQueue, enqueue, flushOnExit } from './transport'

const EXCLUDE_KEY = 'lc_exclude'

export const gpcOn = () => typeof navigator !== 'undefined' && navigator.globalPrivacyControl === true
export const isExcluded = () => readStore(EXCLUDE_KEY) === '1'

function trackingOff() {
  return gpcOn() || isExcluded() || window.location.pathname.startsWith('/console')
}

// Exclude this browser (Logan's own visits) or count it again. Excluding
// also forgets the ids it had, and drops anything still waiting to send.
export function setExcluded(excluded) {
  if (excluded) {
    clearQueue()
    forgetIdentity()
    return writeStore(EXCLUDE_KEY, '1')
  }
  removeStore(EXCLUDE_KEY)
  return true
}

let listening = false
function listenForExit() {
  if (listening) return
  listening = true
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushOnExit()
  })
  window.addEventListener('pagehide', flushOnExit)
}

export function track(name, props = {}) {
  if (!Object.hasOwn(EVENT_SCHEMA, name)) return
  try {
    if (trackingOff()) return
    startIdentity()
    listenForExit()
    const now = Date.now()
    enqueue({
      event_id: uuid(),
      event_name: name,
      occurred_at: new Date(now).toISOString(),
      session_id: sessionFor(now),
      page: window.location.pathname,
      props,
      ...identityFields(),
    })
  } catch {
    // Tracking must never break the site.
  }
}

// This visit's ids, for linking a contact message to it, or null when
// tracking is off for this browser (Global Privacy Control, excluded):
// the message is then kept without a link to any visit.
export function visitIds() {
  try {
    if (trackingOff()) return null
    startIdentity()
    const { visitor_id: visitorId, identity_source: source } = identityFields()
    if (source !== 'persistent') return null
    return { visitor_id: visitorId, session_id: sessionFor(Date.now()) }
  } catch {
    return null
  }
}

// Paths that only redirect (App.jsx sends /sim-racing/:slug to
// /sim-racing); the page they land on is the one that counts.
const REDIRECTS = /^\/sim-racing\/[^/]+/

// Route changes. React's StrictMode runs effects twice in development,
// so the same path in a row counts once.
let lastPath = null
export function trackPage(pathname, { projectSlugs = [] } = {}) {
  if (pathname === lastPath || REDIRECTS.test(pathname)) return
  lastPath = pathname
  track('Page_Viewed')
  const project = pathname.match(/^\/projects\/([^/]+)\/?$/)
  if (project && projectSlugs.includes(project[1])) track('Project_Opened', { slug: project[1] })
  if (/^\/sim-racing\/?$/.test(pathname)) track('Sim_Racing_Viewed')
}
