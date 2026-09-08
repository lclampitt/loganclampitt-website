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
const HAND_W = 18
const HAND_H = 25
const HAND_VIEW_W = 21
const HAND_VIEW_H = 29
const HAND_HOTSPOT = {
  x: (7.15 * HAND_W) / HAND_VIEW_W,
  y: (1.15 * HAND_H) / HAND_VIEW_H,
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
          d="M5.6 1.15h3.1v5h3.1v2.5h3.1v2.5h3.1V23.6c0 2.1-1.7 3.8-3.8 3.8H9.1c-2.1 0-3.8-1.7-3.8-3.8v-4.2L2 16.8l1.7-2.2 1.9 1.6V1.15Z"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}
