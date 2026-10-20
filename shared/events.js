// The event vocabulary, shared by the browser tracker (src/lib/analytics)
// and the ingest function (api/events.js) so the two can never disagree.
// Adding an event means adding it here; the database takes any name.

// Props each event may carry. Anything not declared is dropped by the
// server, so nothing extra (form text, emails) can ride along by accident.
export const EVENT_SCHEMA = {
  Page_Viewed: {},
  Project_Opened: {
    slug: { type: 'string', required: true, max: 80, pattern: /^[a-z0-9-]+$/ },
  },
  Resume_Downloaded: {},
  // Which control opened it: the hero's "Email me" button or the bar.
  Contact_Opened: {
    from: { type: 'string', oneOf: ['email_me', 'contact_bar'] },
  },
  // That it was sent, nothing about what was in it.
  Contact_Sent: {},
  Outbound_Link_Clicked: {
    target: { type: 'string', required: true, oneOf: ['github', 'linkedin', 'email', 'other'] },
    host: { type: 'string', max: 120, pattern: /^[a-z0-9.-]+$/ },
  },
  Sim_Racing_Viewed: {},
}

export const EVENT_NAMES = Object.keys(EVENT_SCHEMA)

// "Looking seriously": the actions that mean more than browsing.
export const SERIOUS_EVENTS = ['Resume_Downloaded', 'Contact_Sent', 'Project_Opened']

// Channel buckets, first match wins (see src/lib/analytics/channel.js).
export const CHANNELS = ['paid', 'organic_search', 'ai', 'social', 'email', 'campaign', 'referral', 'direct']

export const MAX_BATCH = 50
export const MAX_BODY_BYTES = 64 * 1024

// A channel source is a host or a utm_source, lowercased and reduced to
// characters that are safe to show and group by.
export function cleanSource(value) {
  if (typeof value !== 'string') return null
  // Cut first: the trailing hyphen pattern below is slow on a long run of
  // hyphens, and the input can be anything a link or a request sends.
  const cleaned = value
    .slice(0, 240)
    .trim()
    .toLowerCase()
    .replace(/^www\./, '')
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120)
  return cleaned || null
}
