import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { LINKS } from '../data/content'
import { fadeUp } from '../lib/motion'
import {
  DAYS,
  GITHUB_USER,
  LEVEL_COLORS,
  WEEKS,
  buildStylizedCells,
  monthLabels,
  parseJoguber,
} from '../lib/contributions'

const BLOCK = 11
const GAP = 3
const LABEL_H = 18

function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export default function Contributions() {
  const fallback = useMemo(() => buildStylizedCells(), [])
  const [cells, setCells] = useState(fallback)
  const [source, setSource] = useState('stylized')
  const [phase, setPhase] = useState(() => (prefersReducedMotion() ? 'settled' : 'idle'))
  const graphRef = useRef(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${GITHUB_USER}`)
        if (!res.ok) return
        const parsed = parseJoguber(await res.json())
        if (!cancelled && parsed) {
          setCells(parsed)
          setSource('live')
        }
      } catch {
        // Keep the labeled stylized map until a public calendar is available.
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const root = graphRef.current
    if (!root || phase !== 'idle') return undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPhase('enter')
          observer.disconnect()
        }
      },
      { threshold: 0.2, rootMargin: '0px 0px -10% 0px' },
    )
    observer.observe(root)
    return () => observer.disconnect()
  }, [phase])

  useEffect(() => {
    const root = graphRef.current
    if (!root || phase === 'idle' || prefersReducedMotion()) return undefined

    let stopped = false
    const timers = new Set()
    const later = (fn, ms) => {
      const id = window.setTimeout(() => {
        timers.delete(id)
        fn()
      }, ms)
      timers.add(id)
    }

    const nodes = () => Array.from(root.querySelectorAll('rect[data-level]'))

    const pop = (node) => {
      if (typeof node.animate !== 'function') return
      node.animate(
        [
          { transform: 'scale(1)', opacity: 1 },
          { transform: 'scale(0.65)', opacity: 0.35, offset: 0.35 },
          { transform: 'scale(1.35)', opacity: 1, offset: 0.7 },
          { transform: 'scale(1)', opacity: 1 },
        ],
        { duration: 400, easing: 'ease-out' },
      )
    }

    const tick = () => {
      if (stopped) return
      const all = nodes()
      if (all.length === 0) {
        later(tick, 120)
        return
      }
      const active = all.filter((node) => Number(node.dataset.level) > 0)
      const n = 1 + Math.floor(Math.random() * 2)
      for (let i = 0; i < n; i += 1) {
        const pool = active.length > 0 && Math.random() < 0.8 ? active : all
        pop(pool[Math.floor(Math.random() * pool.length)])
      }
      later(tick, 70 + Math.random() * 130)
    }

    if (phase === 'enter') {
      later(() => {
        if (!stopped) setPhase('settled')
      }, WEEKS * 18 + 360)
    }

    later(tick, phase === 'enter' ? 420 : 80)

    return () => {
      stopped = true
      timers.forEach((id) => window.clearTimeout(id))
      timers.clear()
    }
  }, [phase])

  const labels = useMemo(() => monthLabels(cells), [cells])
  const width = WEEKS * (BLOCK + GAP) - GAP
  const height = LABEL_H + DAYS * (BLOCK + GAP) - GAP
  const live = source === 'live'

  return (
    <section id="github" className="pb-20 md:pb-28">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <motion.div {...fadeUp(0)} className="flex flex-wrap items-end justify-between gap-3 mb-8">
          <h2 className="font-display text-sm tracking-[0.22em] uppercase text-muted">
            GitHub
          </h2>
          <p className="font-mono text-[11px] text-dim">
            {live ? 'Public contributions, last year' : 'Stylized activity map, not live totals'}
          </p>
        </motion.div>

        <motion.div
          {...fadeUp(0.06)}
          className="rounded-3xl border border-line bg-surface p-5 md:p-7 overflow-x-auto"
        >
          <div
            ref={graphRef}
            className="git-graph w-max min-w-full"
            data-phase={phase}
          >
            <svg
              width={width}
              height={height}
              viewBox={`0 0 ${width} ${height}`}
              className="block overflow-visible max-w-none"
              role="img"
              aria-label={
                live
                  ? 'Animated GitHub contribution heatmap for the last year'
                  : 'Animated stylized GitHub style contribution heatmap'
              }
            >
              {labels.map((item) => (
                <text
                  key={`${item.label}-${item.week}`}
                  x={item.week * (BLOCK + GAP)}
                  y="0"
                  fill="#71717a"
                  fontSize="10"
                  fontFamily="IBM Plex Mono, ui-monospace, monospace"
                  dominantBaseline="hanging"
                >
                  {item.label}
                </text>
              ))}
              {cells.map((cell) => (
                <rect
                  key={`${cell.week}-${cell.day}-${cell.date}`}
                  x={cell.week * (BLOCK + GAP)}
                  y={LABEL_H + cell.day * (BLOCK + GAP)}
                  width={BLOCK}
                  height={BLOCK}
                  rx="2"
                  ry="2"
                  data-level={cell.level}
                  data-date={cell.date}
                  fill={LEVEL_COLORS[cell.level]}
                  className="git-cell"
                  style={{ '--git-delay': `${cell.week * 18 + cell.day * 4}ms` }}
                >
                  <title>
                    {cell.date}
                    {live && cell.count ? ` · ${cell.count} contributions` : ''}
                  </title>
                </rect>
              ))}
            </svg>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            <a
              href={LINKS.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted hover:text-ink transition-colors"
            >
              github.com/{LINKS.githubHandle} →
            </a>
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-dim">
              <span>Less</span>
              {LEVEL_COLORS.map((color) => (
                <span key={color} className="w-2.5 h-2.5 rounded-[2px]" style={{ backgroundColor: color }} />
              ))}
              <span>More</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
