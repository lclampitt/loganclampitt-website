// Words and numbers for the console. Pacific time throughout. Unknown is
// always said as unknown: these helpers never turn a missing value into 0.

import { PROJECTS, PROJECT_DETAILS } from '../data/content'

export const TZ = 'America/Los_Angeles'

const dateTime = new Intl.DateTimeFormat('en-US', {
  timeZone: TZ, month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
})
const timeOnly = new Intl.DateTimeFormat('en-US', { timeZone: TZ, hour: 'numeric', minute: '2-digit' })
const weekdayShort = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', weekday: 'short' })

const lower = (s) => s.replace('AM', 'am').replace('PM', 'pm')
export const fmtDateTime = (iso) => (iso ? lower(dateTime.format(new Date(iso))) : 'Unknown')
export const fmtTime = (iso) => (iso ? lower(timeOnly.format(new Date(iso))) : 'Unknown')
// 'YYYY-MM-DD' is already a Pacific date from the database.
export const fmtDay = (day) => `${weekdayShort.format(new Date(`${day}T12:00:00Z`))} ${Number(day.slice(8, 10))}`

export const fmtNumber = (n) => (n == null ? 'Unknown' : Number(n).toLocaleString('en-US'))
export const plural = (n, one, many = `${one}s`) => `${fmtNumber(n)} ${Number(n) === 1 ? one : many}`

const CHANNELS = {
  paid: 'Paid',
  organic_search: 'Search',
  ai: 'AI assistants',
  social: 'Social',
  email: 'Email',
  campaign: 'Tagged links',
  referral: 'Other sites',
  direct: 'Direct',
}
// NULL means the browser could not keep the first visit, not "direct".
export const channelLabel = (channel) => (channel ? CHANNELS[channel] ?? channel : 'Not measured')

export function cameFrom(channel, source) {
  if (!channel) return 'Not measured'
  return source ? `${channelLabel(channel)}, ${source}` : channelLabel(channel)
}

export function placeLabel(place) {
  if (!place || (!place.city && !place.country)) return 'Not resolved'
  const where = place.country === 'US' ? place.region : place.country
  return [place.city, where].filter(Boolean).join(', ')
}

export function machineLabel(machine) {
  if (!machine) return 'Unknown'
  const device = machine.device ? machine.device[0].toUpperCase() + machine.device.slice(1) : null
  const app = machine.browser && machine.os ? `${machine.browser} on ${machine.os}` : machine.browser || machine.os
  return [device, app].filter(Boolean).join(', ') || 'Unknown'
}

const TITLES = Object.fromEntries([
  ...PROJECTS.map((p) => [p.slug, p.title]),
  ...Object.entries(PROJECT_DETAILS).map(([slug, d]) => [slug, d.title]),
])
export const projectTitle = (slug) => TITLES[slug] ?? slug

const PAGE_NAMES = { '/': 'Home', '/sim-racing': 'Sim racing', '/privacy': 'Privacy' }
export function pageLabel(page) {
  if (!page) return 'Unknown page'
  const project = page.match(/^\/projects\/([^/]+)/)
  if (project) return `Project: ${projectTitle(project[1])}`
  return PAGE_NAMES[page] ?? page
}

export const SERIOUS_LABELS = {
  Resume_Downloaded: 'Downloaded the resume',
  Contact_Sent: 'Sent a message',
  Project_Opened: 'Opened a project',
}

export function eventLabel(e) {
  switch (e.event_name) {
    case 'Page_Viewed':
      return `Viewed ${pageLabel(e.page)}`
    case 'Project_Opened':
      return `Opened ${projectTitle(e.props?.slug)}`
    case 'Resume_Downloaded':
      return 'Downloaded the resume'
    case 'Contact_Opened':
      return 'Opened the contact form'
    case 'Contact_Sent':
      return 'Sent a message'
    case 'Outbound_Link_Clicked':
      if (e.props?.target === 'email') return 'Clicked the email address'
      return `Went to ${e.props?.host ?? e.props?.target ?? 'another site'}`
    case 'Sim_Racing_Viewed':
      return 'Viewed sim racing'
    default:
      return e.event_name
  }
}

export const isSerious = (name) => Object.hasOwn(SERIOUS_LABELS, name)

// Said on every view of a non production deployment, so test data is
// never mistaken for the live site.
export function envNote(env) {
  if (!env || env === 'production') return null
  return env === 'preview' ? 'Preview deployment: preview data only.' : 'Local data only.'
}
