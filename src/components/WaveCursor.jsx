import { useEffect, useRef, useState } from 'react'

const INTERACTIVE = 'a, button, [role="button"], input, textarea, select, label, summary'
const SIZE = 140
const HALF = SIZE / 2
const POINTS = 32

function waveCursorAllowed() {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(pointer: fine)').matches
    && window.matchMedia('(hover: hover)').matches
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

function isInteractive(node) {
  if (!node || node.nodeType !== 1) return false
  return Boolean(node.closest(INTERACTIVE))
}

function blobPath(time, hover) {
  const radius = 13 + hover * 15
  const amp = 1.5 + hover * 3.4
  const squashX = 1 + hover * 0.78
  const squashY = 1 - hover * 0.16
  const pts = []

  for (let i = 0; i < POINTS; i += 1) {
    const angle = (i / POINTS) * Math.PI * 2
    const wave = Math.sin(angle * 3 + time) * amp
      + Math.sin(angle * 5 + time * 1.37) * amp * 0.38
    pts.push({
      x: HALF + Math.cos(angle) * (radius + wave) * squashX,
      y: HALF + Math.sin(angle) * (radius + wave) * squashY,
    })
  }

  const first = pts[0]
  let d = `M ${first.x.toFixed(2)} ${first.y.toFixed(2)}`
  for (let i = 0; i < POINTS; i += 1) {
    const p0 = pts[(i - 1 + POINTS) % POINTS]
    const p1 = pts[i]
    const p2 = pts[(i + 1) % POINTS]
    const p3 = pts[(i + 2) % POINTS]
    const c1x = p1.x + (p2.x - p0.x) / 6
    const c1y = p1.y + (p2.y - p0.y) / 6
    const c2x = p2.x - (p3.x - p1.x) / 6
    const c2y = p2.y - (p3.y - p1.y) / 6
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`
  }
  return `${d} Z`
}

export default function WaveCursor() {
  const [enabled, setEnabled] = useState(waveCursorAllowed)
  const svgRef = useRef(null)
  const pathRef = useRef(null)
  const pos = useRef({ x: 0, y: 0 })
  const target = useRef({ x: 0, y: 0 })
  const hover = useRef(0)
  const hoverTarget = useRef(0)
  const time = useRef(0)
  const visible = useRef(false)
  const raf = useRef(0)

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)')
    const hoverMq = window.matchMedia('(hover: hover)')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setEnabled(waveCursorAllowed())
    fine.addEventListener('change', sync)
    hoverMq.addEventListener('change', sync)
    reduce.addEventListener('change', sync)
    return () => {
      fine.removeEventListener('change', sync)
      hoverMq.removeEventListener('change', sync)
      reduce.removeEventListener('change', sync)
    }
  }, [])

  useEffect(() => {
    if (!enabled) return undefined

    document.documentElement.dataset.waveCursor = 'on'
    const svg = svgRef.current
    const path = pathRef.current
    if (!svg || !path) {
      document.documentElement.removeAttribute('data-wave-cursor')
      return undefined
    }

    const tick = () => {
      time.current += 0.045
      hover.current += (hoverTarget.current - hover.current) * 0.16
      pos.current.x += (target.current.x - pos.current.x) * 0.16
      pos.current.y += (target.current.y - pos.current.y) * 0.16

      path.setAttribute('d', blobPath(time.current, hover.current))
      svg.style.opacity = visible.current ? '1' : '0'
      svg.style.transform = `translate3d(${pos.current.x - HALF}px, ${pos.current.y - HALF}px, 0)`
      raf.current = window.requestAnimationFrame(tick)
    }

    const onMove = (event) => {
      target.current.x = event.clientX
      target.current.y = event.clientY
      if (!visible.current) {
        pos.current.x = event.clientX
        pos.current.y = event.clientY
        visible.current = true
      }
      hoverTarget.current = isInteractive(event.target) ? 1 : 0
    }

    const onLeave = () => {
      visible.current = false
      hoverTarget.current = 0
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerleave', onLeave)
    document.addEventListener('mouseleave', onLeave)
    raf.current = window.requestAnimationFrame(tick)

    return () => {
      window.cancelAnimationFrame(raf.current)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerleave', onLeave)
      document.removeEventListener('mouseleave', onLeave)
      document.documentElement.removeAttribute('data-wave-cursor')
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <svg
      ref={svgRef}
      className="wave-cursor"
      width={SIZE}
      height={SIZE}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      aria-hidden="true"
    >
      <defs>
        <filter id="wave-cursor-soft" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.7" />
        </filter>
        <radialGradient id="wave-cursor-fill" cx="38%" cy="32%" r="72%">
          <stop offset="0%" stopColor="var(--wave-cursor-inner)" />
          <stop offset="100%" stopColor="var(--wave-cursor)" />
        </radialGradient>
      </defs>
      <path
        ref={pathRef}
        fill="url(#wave-cursor-fill)"
        filter="url(#wave-cursor-soft)"
      />
    </svg>
  )
}
