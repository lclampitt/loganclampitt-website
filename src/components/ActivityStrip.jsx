import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { LINKS } from '../data/content'
import { useIntro } from '../context/useIntro'
import { useTheme } from '../context/useTheme'
import { DAYS, WEEKS, buildStylizedCells, getGitPopColors, getLevelColors } from '../lib/contributions'

function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export default function ActivityStrip() {
  const { contentReady } = useIntro()
  const { theme } = useTheme()
  const cells = useMemo(() => buildStylizedCells(), [])
  const colors = getLevelColors()
  const [innerWidth, setInnerWidth] = useState(0)
  const [started, setStarted] = useState(() => prefersReducedMotion())
  const cardRef = useRef(null)
  const graphRef = useRef(null)

  useLayoutEffect(() => {
    const el = cardRef.current
    if (!el) return undefined

    const measure = () => {
      const styles = window.getComputedStyle(el)
      const padding = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight)
      const next = Math.max(0, el.clientWidth - padding)
      setInnerWidth((current) => (Math.abs(current - next) < 0.5 ? current : next))
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    window.addEventListener('resize', measure)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])

  const gap = innerWidth > 0 && innerWidth < 540 ? 2 : 3
  const block = innerWidth > 0
    ? Math.max(4, (innerWidth - (WEEKS - 1) * gap) / WEEKS)
    : 0
  const graphWidth = block > 0 ? WEEKS * (block + gap) - gap : 0
  const height = block > 0 ? DAYS * (block + gap) - gap : 0

  useEffect(() => {
    if (!contentReady) return undefined
    if (graphWidth > 0 && !started && !prefersReducedMotion()) {
      const id = window.setTimeout(() => setStarted(true), 80)
      return () => window.clearTimeout(id)
    }
    return undefined
  }, [contentReady, graphWidth, started])

  useEffect(() => {
    const root = graphRef.current
    if (!root || !started || graphWidth <= 0) return undefined

    const nodes = Array.from(root.querySelectorAll('rect[data-level]'))
    const reduced = prefersReducedMotion()
    let stopped = false
    const timers = new Set()
    const later = (fn, ms) => {
      const id = window.setTimeout(() => {
        timers.delete(id)
        fn()
      }, ms)
      timers.add(id)
    }

    nodes.forEach((node) => {
      node.setAttribute('fill', reduced ? colors[Number(node.dataset.level) || 0] : colors[0])
    })

    if (!reduced) {
      nodes.forEach((node) => {
        const week = Number(node.dataset.week)
        const day = Number(node.dataset.day)
        const level = Number(node.dataset.level) || 0
        later(() => {
          if (stopped) return
          node.setAttribute('fill', getLevelColors()[level])
        }, 140 + week * 32 + day * 12)
      })
    }

    const pop = (node) => {
      if (stopped) return
      const level = Number(node.dataset.level) || 0
      if (level === 0) return
      const palette = getLevelColors()
      const pops = getGitPopColors()
      const base = palette[level]
      node.setAttribute('fill', level >= 3 ? pops.high : pops.low)
      if (typeof node.animate === 'function') {
        node.animate(
          [
            { transform: 'scale(1)' },
            { transform: 'scale(1.42)', offset: 0.4 },
            { transform: 'scale(1)' },
          ],
          { duration: 420, easing: 'ease-out' },
        )
      }
      later(() => {
        if (!stopped) node.setAttribute('fill', base)
      }, 200)
    }

    const tick = () => {
      if (stopped) return
      const active = nodes.filter((node) => Number(node.dataset.level) > 0)
      const pool = active.length ? active : nodes
      const n = 2 + Math.floor(Math.random() * 2)
      for (let i = 0; i < n; i += 1) {
        pop(pool[Math.floor(Math.random() * pool.length)])
      }
      later(tick, 180 + Math.random() * 200)
    }

    if (!reduced) {
      later(tick, 140 + WEEKS * 18)
    }

    return () => {
      stopped = true
      timers.forEach((id) => window.clearTimeout(id))
      timers.clear()
    }
  }, [colors, graphWidth, started, theme])

  const reducedMotion = prefersReducedMotion()

  return (
    <a
      ref={cardRef}
      href={LINKS.github}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Open Logan Clampitt on GitHub. Decorative activity pattern, not live totals."
      className="block w-full min-w-0"
    >
      <p className="mb-3 font-mono text-[10px] tracking-[0.2em] uppercase text-dim">GitHub</p>

      <div ref={graphRef} className="relative git-graph w-full min-w-0 overflow-hidden">
        {graphWidth > 0 && (
          <svg
            width={graphWidth}
            height={height}
            viewBox={`0 0 ${graphWidth} ${height}`}
            preserveAspectRatio="none"
            className="block w-full"
            style={{ width: '100%', height }}
            role="img"
            aria-hidden="true"
          >
            {cells.map((cell) => (
              <rect
                key={`${cell.week}-${cell.day}`}
                x={cell.week * (block + gap)}
                y={cell.day * (block + gap)}
                width={block}
                height={block}
                rx="2"
                ry="2"
                data-level={cell.level}
                data-week={cell.week}
                data-day={cell.day}
                fill={started && reducedMotion ? colors[cell.level] : colors[0]}
                className="git-cell"
              />
            ))}
          </svg>
        )}
        <span className="git-caustics" aria-hidden="true" />
      </div>
    </a>
  )
}
