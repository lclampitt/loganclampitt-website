import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useIntro } from '../context/useIntro'
import { scrollToId, scrollToTop } from '../lib/scroll'

const HASH_SETTLE_MS = 2000
const HASH_SETTLE_INTERVAL_MS = 100

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
        scrollToId(id)
        if (performance.now() - startedAt < HASH_SETTLE_MS) {
          timer = window.setTimeout(tick, HASH_SETTLE_INTERVAL_MS)
        }
      }

      const frame = window.requestAnimationFrame(tick)

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
