import { useEffect, useRef, useState } from 'react'

const MAX_POINTS = 18
const MIN_SPACING = 6

function waveCursorAllowed() {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(pointer: fine)').matches
    && window.matchMedia('(hover: hover)').matches
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

function readColors() {
  const styles = getComputedStyle(document.documentElement)
  return {
    foam: styles.getPropertyValue('--wave-foam').trim() || '#ffffff',
    head: styles.getPropertyValue('--wave-tail-0').trim() || 'rgba(14, 58, 82, 0.88)',
    mid: styles.getPropertyValue('--wave-tail-1').trim() || 'rgba(31, 111, 122, 0.4)',
    tail: styles.getPropertyValue('--wave-tail-2').trim() || 'rgba(31, 111, 122, 0)',
  }
}

function drawRibbon(ctx, points, time, colors) {
  if (points.length < 2) return

  const left = []
  const right = []
  const last = points.length - 1

  for (let i = 0; i <= last; i += 1) {
    const prev = points[Math.max(i - 1, 0)]
    const next = points[Math.min(i + 1, last)]
    let tx = next.x - prev.x
    let ty = next.y - prev.y
    const len = Math.hypot(tx, ty) || 1
    tx /= len
    ty /= len
    const nx = -ty
    const ny = tx
    const t = i / last
    const width = (7.5 * (1 - t) + 0.6 * t)
    const sway = Math.sin(time * 2.4 + i * 0.65) * (1.1 * (1 - t) + 0.2)
    const point = points[i]
    left.push(point.x + nx * (width + sway), point.y + ny * (width + sway))
    right.push(point.x - nx * (width * 0.85 - sway * 0.35), point.y - ny * (width * 0.85 - sway * 0.35))
  }

  const gradient = ctx.createLinearGradient(
    points[0].x,
    points[0].y,
    points[last].x,
    points[last].y,
  )
  gradient.addColorStop(0, colors.head)
  gradient.addColorStop(0.4, colors.mid)
  gradient.addColorStop(1, colors.tail)

  ctx.beginPath()
  ctx.moveTo(left[0], left[1])
  for (let i = 2; i < left.length; i += 2) ctx.lineTo(left[i], left[i + 1])
  for (let i = right.length - 2; i >= 0; i -= 2) ctx.lineTo(right[i], right[i + 1])
  ctx.closePath()
  ctx.fillStyle = gradient
  ctx.fill()
}

function drawFoam(ctx, x, y, speed, foam) {
  const radius = 4.2 + Math.min(2.2, speed * 0.12)
  ctx.save()
  ctx.fillStyle = foam
  ctx.shadowColor = foam
  ctx.shadowBlur = 10
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.fill()
  ctx.shadowBlur = 0
  ctx.globalAlpha = 0.95
  ctx.beginPath()
  ctx.arc(x - radius * 0.18, y - radius * 0.18, radius * 0.42, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

export default function WaveCursor() {
  const [enabled, setEnabled] = useState(waveCursorAllowed)
  const canvasRef = useRef(null)
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

    const canvas = canvasRef.current
    if (!canvas) return undefined

    document.documentElement.dataset.waveCursor = 'on'
    const ctx = canvas.getContext('2d', { alpha: true })
    const history = []
    const foam = { x: 0, y: 0 }
    let visible = false
    let speed = 0
    let time = 0
    let colors = readColors()

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const width = window.innerWidth
      const height = window.innerHeight
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const maxLen = () => 5 + Math.min(13, Math.round(speed * 0.55))

    const tick = () => {
      time += 0.05
      speed *= 0.88
      const cap = maxLen()
      if (speed < 1.1 && history.length) {
        history[0].x += (foam.x - history[0].x) * 0.16
        history[0].y += (foam.y - history[0].y) * 0.16
        for (let i = 1; i < history.length; i += 1) {
          history[i].x += (history[i - 1].x - history[i].x) * 0.16
          history[i].y += (history[i - 1].y - history[i].y) * 0.16
        }
      }
      while (history.length > cap) history.pop()
      if (speed < 0.35 && history.length > 3) history.pop()

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      if (visible) {
        const ribbon = [{ x: foam.x, y: foam.y }, ...history]
        drawRibbon(ctx, ribbon, time, colors)
        drawFoam(ctx, foam.x, foam.y, speed, colors.foam)
      }
      raf.current = window.requestAnimationFrame(tick)
    }

    const onMove = (event) => {
      const x = event.clientX
      const y = event.clientY
      if (visible) {
        const dist = Math.hypot(x - foam.x, y - foam.y)
        speed = Math.max(speed, dist)
        if (dist >= MIN_SPACING) {
          history.unshift({ x: foam.x, y: foam.y })
          if (history.length > MAX_POINTS) history.pop()
        }
      }
      foam.x = x
      foam.y = y
      visible = true
    }

    const onLeave = () => {
      visible = false
      history.length = 0
      speed = 0
    }

    const onTheme = () => {
      colors = readColors()
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerleave', onLeave)
    document.addEventListener('mouseleave', onLeave)
    const themeWatch = new MutationObserver(onTheme)
    themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    raf.current = window.requestAnimationFrame(tick)

    return () => {
      window.cancelAnimationFrame(raf.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerleave', onLeave)
      document.removeEventListener('mouseleave', onLeave)
      themeWatch.disconnect()
      document.documentElement.removeAttribute('data-wave-cursor')
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <canvas
      ref={canvasRef}
      className="wave-cursor"
      aria-hidden="true"
    />
  )
}
