import { useEffect, useRef, useState } from 'react'

const FINE = '(pointer: fine)'
const HOVER = '(hover: hover)'
const REDUCE = '(prefers-reduced-motion: reduce)'
const HOT = 'a, button, input, textarea, select, label, summary, [role="button"], [role="link"]'
const ARROW_SIZE = 18
const ARROW_VIEW = 28
const ARROW_HOTSPOT = {
  x: (5 * ARROW_SIZE) / ARROW_VIEW,
  y: (3.2 * ARROW_SIZE) / ARROW_VIEW,
}
const HAND_W = 20
const HAND_H = 24
const HAND_VIEW_W = 26
const HAND_VIEW_H = 30
const HAND_HOTSPOT = {
  x: (8.1 * HAND_W) / HAND_VIEW_W,
  y: (1.5 * HAND_H) / HAND_VIEW_H,
}

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
  const pointRef = useRef(false)
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
      const hot = pointRef.current ? HAND_HOTSPOT : ARROW_HOTSPOT
      node.style.transform = `translate3d(${x - hot.x}px, ${y - hot.y}px, 0)`
      node.classList.add('is-on')
    }

    const onMove = (event) => {
      posRef.current = { x: event.clientX, y: event.clientY }
      if (!rafRef.current) rafRef.current = window.requestAnimationFrame(flush)
    }

    const setPoint = (next) => {
      if (pointRef.current === next) return
      pointRef.current = next
      node?.classList.toggle('is-point', next)
      flush()
    }

    const onOver = (event) => {
      const target = event.target
      setPoint(Boolean(target instanceof Element && target.closest(HOT)))
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerover', onOver, { passive: true })

    return () => {
      delete root.dataset.cursor
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerover', onOver)
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current)
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <div ref={rootRef} className="arrow-cursor" aria-hidden="true">
      <svg
        className="arrow-cursor-mark arrow-cursor-arrow"
        width={ARROW_SIZE}
        height={ARROW_SIZE}
        viewBox={`0 0 ${ARROW_VIEW} ${ARROW_VIEW}`}
        fill="none"
      >
        <path
          d="M5 3.2 5 23.4 10.2 18.1 14.4 26.8 18 25.3 13.7 16.5 21.6 16.5Z"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
      <svg
        className="arrow-cursor-mark arrow-cursor-hand"
        width={HAND_W}
        height={HAND_H}
        viewBox={`0 0 ${HAND_VIEW_W} ${HAND_VIEW_H}`}
        fill="none"
      >
        <path
          d="M8.1 1.5c-.95 0-1.7.75-1.7 1.7v10.05L4.15 11.2c-.75-.65-1.95-.35-2.1.9-.15 1.15.55 1.95 1.55 2.75l2.8 2.2v2.35c0 2.95 2.35 5.3 5.3 5.3h4.85c2.8 0 5.05-2.3 5.05-5.1V12.15c0-.95-.75-1.7-1.7-1.7-.4 0-.75.12-1.05.35V9c0-.95-.75-1.7-1.7-1.7-.4 0-.75.12-1.05.35V7.55c0-.95-.75-1.7-1.7-1.7-.4 0-.75.12-1.05.35V3.2c0-.95-.75-1.7-1.7-1.7-.45 0-.85.18-1.15.48-.25-.3-.7-.48-1.15-.48Z"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}
