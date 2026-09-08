import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { scrollToId, scrollToTop } from '../lib/scroll'

export default function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '')
      const frame = window.requestAnimationFrame(() => {
        scrollToId(id)
      })
      return () => window.cancelAnimationFrame(frame)
    }

    scrollToTop({ immediate: true })
    return undefined
  }, [pathname, hash])

  return null
}
