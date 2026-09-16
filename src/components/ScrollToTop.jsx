import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useIntro } from '../context/useIntro'
import { scrollToId, scrollToTop } from '../lib/scroll'

const HASH_SETTLE_MS = 2500
const HASH_SETTLE_INTERVAL_MS = 100
const HASH_NEAR_PX = 140

function isNearSection(id) {
  const el = document.getElementById(id)
  if (!el) return false
  return Math.abs(el.getBoundingClientRect().top) < HASH_NEAR_PX
}

export default function ScrollToTop() {
  const { pathname, hash } = useLocation()
  const { contentReady } = useIntro()

  useEffect(() => {
    if (hash) {
      // Wait until intro overlay is done so section positions are final.
      if (!contentReady) return undefined

      const id = hash.replace('#', '')
      let cancelled = false
      let timer = 0
      const startedAt = performance.now()

      const tick = () => {
        if (cancelled) return
        const el = document.getElementById(id)
        if (el && !isNearSection(id)) {
          // Immediate retries avoid restarting Lenis smooth scrolls mid-flight.
          scrollToId(id, { immediate: true })
        }
        if (performance.now() - startedAt < HASH_SETTLE_MS) {
          timer = window.setTimeout(tick, HASH_SETTLE_INTERVAL_MS)
        }
      }

      // First attempt can animate; subsequent ticks correct layout drift.
      const frame = window.requestAnimationFrame(() => {
        if (cancelled) return
        scrollToId(id)
        timer = window.setTimeout(tick, HASH_SETTLE_INTERVAL_MS)
      })

      return () => {
        cancelled = true
        window.cancelAnimationFrame(frame)
        window.clearTimeout(timer)
      }
    }

    scrollToTop({ immediate: true })
    return undefined
  }, [pathname, hash, contentReady])

  return null
}
