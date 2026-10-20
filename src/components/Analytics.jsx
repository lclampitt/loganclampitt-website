import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { LINKS, PROJECTS, PROJECT_DETAILS } from '../data/content'
import { useContact } from '../context/useContact'
import { track, trackPage } from '../lib/analytics'

const PROJECT_SLUGS = Object.keys(PROJECT_DETAILS)
const CARD_SLUGS = PROJECTS.map((p) => p.slug)

function outboundTarget(host) {
  if (host === 'github.com' || host.endsWith('.github.com')) return 'github'
  if (host === 'linkedin.com' || host.endsWith('.linkedin.com')) return 'linkedin'
  return 'other'
}

// One listener for every link on the site: the resume, and links that
// leave it. Middle clicks (auxclick) open a tab too, so they count.
function onLinkClick(event) {
  if (event.type === 'auxclick' && event.button !== 1) return
  const link = event.target instanceof Element ? event.target.closest('a[href]') : null
  if (!link) return
  let url
  try {
    url = new URL(link.href, window.location.href)
  } catch {
    return
  }
  if (url.protocol === 'mailto:') {
    track('Outbound_Link_Clicked', { target: 'email' })
    return
  }
  if (url.origin === window.location.origin) {
    if (url.pathname === LINKS.resume) track('Resume_Downloaded')
    return
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return
  // A project card that goes straight to the live site is still opening
  // the project. (A card to the case study counts on its route instead.)
  const card = link.dataset.project
  if (card && CARD_SLUGS.includes(card)) track('Project_Opened', { slug: card })
  const host = url.hostname.toLowerCase().replace(/^www\./, '')
  track('Outbound_Link_Clicked', { target: outboundTarget(host), host })
}

// Renders nothing. Sends page views on every route change, plus the
// events that are about the app's state rather than a link.
export default function Analytics() {
  const { pathname } = useLocation()
  const { open } = useContact()
  const wasOpen = useRef(open)

  useEffect(() => {
    trackPage(pathname, { projectSlugs: PROJECT_SLUGS })
  }, [pathname])

  useEffect(() => {
    if (open && !wasOpen.current) track('Contact_Opened')
    wasOpen.current = open
  }, [open])

  useEffect(() => {
    document.addEventListener('click', onLinkClick, true)
    document.addEventListener('auxclick', onLinkClick, true)
    return () => {
      document.removeEventListener('click', onLinkClick, true)
      document.removeEventListener('auxclick', onLinkClick, true)
    }
  }, [])

  return null
}
