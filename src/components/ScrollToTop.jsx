import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Scroll to top on route changes, but honor hash targets (e.g. /#projects)
 * so "Back to Projects" / nav links from detail pages land on the section.
 *
 * Keeps re-scrolling briefly after the target appears so late layout shifts
 * (hero image load, fonts, AnimatePresence mount) don't leave the viewport short.
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
    const settleMs = 2000

    const tryScroll = () => {
      if (cancelled) return
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: 'auto', block: 'start' })
      }
      // AnimatePresence + image/font layout can shift offsetTop after first hit.
      if (performance.now() - startedAt < settleMs) {
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
