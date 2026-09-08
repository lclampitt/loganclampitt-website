import { useEffect, useRef, useState } from 'react'

const FINE = '(pointer: fine)'
const HOVER = '(hover: hover)'
const REDUCE = '(prefers-reduced-motion: reduce)'
const HOT = 'a, button, input, textarea, select, label, summary, [role="button"], [role="link"]'

function canUseDotCursor() {
  if (typeof window === 'undefined') return false
  return window.matchMedia(FINE).matches
    && window.matchMedia(HOVER).matches
    && !window.matchMedia(REDUCE).matches
}

export default function DotCursor() {
  const rootRef = useRef(null)
  const coreRef = useRef(null)
  const rafRef = useRef(0)
  const posRef = useRef({ x: 0, y: 0 })
  const hotRef = useRef(false)
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const fine = window.matchMedia(FINE)
    const hover = window.matchMedia(HOVER)
    const reduce = window.matchMedia(REDUCE)
    const sync = () => setEnabled(canUseDotCursor())
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

    root.dataset.cursor = 'dot'
    const node = rootRef.current
    const core = coreRef.current

    const flush = () => {
      rafRef.current = 0
      if (!node) return
      const { x, y } = posRef.current
      node.style.transform = `translate3d(${x}px, ${y}px, 0)`
      node.classList.add('is-on')
    }

    const onMove = (event) => {
      posRef.current = { x: event.clientX, y: event.clientY }
      if (!rafRef.current) rafRef.current = window.requestAnimationFrame(flush)
    }

    const setHot = (next) => {
      if (hotRef.current === next) return
      hotRef.current = next
      core?.classList.toggle('is-hot', next)
    }

    const onOver = (event) => {
      const target = event.target
      setHot(Boolean(target instanceof Element && target.closest(HOT)))
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
    <div ref={rootRef} className="dot-cursor" aria-hidden="true">
      <span ref={coreRef} className="dot-cursor-core" />
    </div>
  )
}
