import { useEffect, useRef, useState } from 'react'

const FINE = '(pointer: fine)'
const HOVER = '(hover: hover)'
const REDUCE = '(prefers-reduced-motion: reduce)'
const HOTSPOT_X = 5
const HOTSPOT_Y = 3

function canUseArrowCursor() {
  if (typeof window === 'undefined') return false
  return window.matchMedia(FINE).matches
    && window.matchMedia(HOVER).matches
    && !window.matchMedia(REDUCE).matches
}

export default function ArrowCursor() {
  const rootRef = useRef(null)
  const rafRef = useRef(0)
  const posRef = useRef({ x: 0, y: 0 })
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const fine = window.matchMedia(FINE)
    const hover = window.matchMedia(HOVER)
    const reduce = window.matchMedia(REDUCE)
    const sync = () => setEnabled(canUseArrowCursor())
    sync()
    fine.addEventListener('change', sync)
    hover.addEventListener('change', sync)
    reduce.addEventListener('change', sync)
    return () => {
      fine.removeEventListener('change', sync)
      hover.removeEventListener('change', sync)
      reduce.removeEventListener('change', sync)
    }
  }, [])

  useEffect(() => {
    const root = document.documentElement
    if (!enabled) {
      delete root.dataset.cursor
      return undefined
    }

    root.dataset.cursor = 'arrow'
    const node = rootRef.current

    const flush = () => {
      rafRef.current = 0
      if (!node) return
      const { x, y } = posRef.current
      node.style.transform = `translate3d(${x - HOTSPOT_X}px, ${y - HOTSPOT_Y}px, 0)`
      node.classList.add('is-on')
    }

    const onMove = (event) => {
      posRef.current = { x: event.clientX, y: event.clientY }
      if (!rafRef.current) rafRef.current = window.requestAnimationFrame(flush)
    }

    window.addEventListener('pointermove', onMove, { passive: true })

    return () => {
      delete root.dataset.cursor
      window.removeEventListener('pointermove', onMove)
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current)
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <div ref={rootRef} className="arrow-cursor" aria-hidden="true">
      <svg
        className="arrow-cursor-mark"
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
      >
        <path
          d="M5 3.2 5 23.4 10.2 18.1 14.4 26.8 18 25.3 13.7 16.5 21.6 16.5Z"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}
