import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Scroll to top on route changes, but honor hash targets (e.g. /#projects)
 * so "Back to Projects" / nav links from detail pages land on the section.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      return
    }

    const id = decodeURIComponent(hash.slice(1))
    if (!id) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      return
    }

    let cancelled = false
    let rafId = 0
    const startedAt = performance.now()

    const tryScroll = () => {
      if (cancelled) return
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: 'auto' })
        return
      }
      // AnimatePresence mode="wait" delays mount ~350ms; keep trying briefly.
      if (performance.now() - startedAt < 1200) {
        rafId = requestAnimationFrame(tryScroll)
      }
    }

    rafId = requestAnimationFrame(tryScroll)

    return () => {
      cancelled = true
      cancelAnimationFrame(rafId)
    }
  }, [pathname, hash])

  return null
}
