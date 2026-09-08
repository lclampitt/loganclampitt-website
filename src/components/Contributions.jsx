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
const EMPTY = LEVEL_COLORS[0]

function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export default function Contributions() {
  const fallback = useMemo(() => buildStylizedCells(), [])
  const [cells, setCells] = useState(fallback)
  const [source, setSource] = useState('stylized')
  const [started, setStarted] = useState(() => prefersReducedMotion())
  const sectionRef = useRef(null)
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
    const section = sectionRef.current
    if (!section || started) return undefined

    const reveal = () => setStarted(true)
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) reveal()
      },
      { threshold: 0.2 },
    )
    observer.observe(section)
    return () => observer.disconnect()
  }, [started])

  useEffect(() => {
    const root = graphRef.current
    if (!root || !started) return undefined

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
      node.setAttribute('fill', reduced ? LEVEL_COLORS[Number(node.dataset.level) || 0] : EMPTY)
    })

    if (!reduced) {
      nodes.forEach((node) => {
        const week = Number(node.dataset.week)
        const day = Number(node.dataset.day)
        const level = Number(node.dataset.level) || 0
        later(() => {
          if (stopped) return
          node.setAttribute('fill', LEVEL_COLORS[level])
        }, week * 26 + day * 8)
      })
    }

    const pop = (node) => {
      if (stopped) return
      const level = Number(node.dataset.level) || 0
      const base = LEVEL_COLORS[level]
      node.setAttribute('fill', '#f0d36a')
      if (typeof node.animate === 'function') {
        node.animate(
          [
            { transform: 'scale(1)' },
            { transform: 'scale(0.7)', offset: 0.35 },
            { transform: 'scale(1.6)', offset: 0.7 },
            { transform: 'scale(1)' },
          ],
          { duration: 380, easing: 'ease-out' },
        )
      }
      later(() => {
        if (!stopped) node.setAttribute('fill', base)
      }, 180)
    }

    const tick = () => {
      if (stopped) return
      const active = nodes.filter((node) => Number(node.dataset.level) > 0)
      const pool = active.length ? active : nodes
      const n = 3 + Math.floor(Math.random() * 4)
      for (let i = 0; i < n; i += 1) {
        pop(pool[Math.floor(Math.random() * pool.length)])
      }
      later(tick, 60 + Math.random() * 90)
    }

    if (!reduced) {
      later(tick, WEEKS * 26 + 200)
    }

    return () => {
      stopped = true
      timers.forEach((id) => window.clearTimeout(id))
      timers.clear()
    }
  }, [started, cells])

  const labels = useMemo(() => monthLabels(cells), [cells])
  const width = WEEKS * (BLOCK + GAP) - GAP
  const height = LABEL_H + DAYS * (BLOCK + GAP) - GAP
  const live = source === 'live'
  const reducedMotion = prefersReducedMotion()

  return (
    <section id="github" ref={sectionRef} className="pb-20 md:pb-28">
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
          <div ref={graphRef} className="git-graph w-max min-w-full">
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
                  data-week={cell.week}
                  data-day={cell.day}
                  data-date={cell.date}
                  fill={started && reducedMotion ? LEVEL_COLORS[cell.level] : EMPTY}
                  className="git-cell"
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
