import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
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
  parseActivityList,
  parseJoguber,
} from '../lib/contributions'

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
  const [innerWidth, setInnerWidth] = useState(0)
  const sectionRef = useRef(null)
  const graphRef = useRef(null)
  const wrapRef = useRef(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const endpoints = [
        [`https://github-contributions-api.jogruber.de/v4/${GITHUB_USER}`, (data) => parseJoguber(data)],
        [`https://github.vineet.pro/api/${GITHUB_USER}`, (data) => parseActivityList(data?.data || data)],
      ]

      for (const [url, parse] of endpoints) {
        try {
          const res = await fetch(url)
          if (!res.ok) continue
          const parsed = parse(await res.json())
          if (!cancelled && parsed) {
            setCells(parsed)
            setSource('live')
            return
          }
        } catch {
          // Try the next public feed.
        }
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  useLayoutEffect(() => {
    const el = wrapRef.current
    if (!el) return undefined

    const measure = () => {
      const next = el.getBoundingClientRect().width
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

  useEffect(() => {
    const section = sectionRef.current
    if (!section || started) return undefined

    const check = () => {
      if (window.scrollY < 120) return
      const rect = section.getBoundingClientRect()
      const vh = window.innerHeight || 800
      if (rect.top < vh * 0.55 && rect.bottom > vh * 0.3) {
        setStarted(true)
      }
    }

    check()
    window.addEventListener('scroll', check, { passive: true })
    window.addEventListener('resize', check)
    return () => {
      window.removeEventListener('scroll', check)
      window.removeEventListener('resize', check)
    }
  }, [started])

  const weekCount = useMemo(
    () => cells.reduce((max, cell) => Math.max(max, cell.week + 1), 0) || WEEKS,
    [cells],
  )
  const gap = innerWidth > 0 && innerWidth < 540 ? 2 : 3
  const block = innerWidth > 0
    ? Math.max(4, (innerWidth - (weekCount - 1) * gap) / weekCount)
    : 0
  const graphWidth = block > 0 ? weekCount * (block + gap) - gap : 0
  const height = block > 0 ? LABEL_H + DAYS * (block + gap) - gap : 0

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
        }, 280 + week * 42 + day * 10)
      })
    }

    const pop = (node) => {
      if (stopped) return
      const level = Number(node.dataset.level) || 0
      const base = LEVEL_COLORS[level]
      node.setAttribute('fill', '#e4e4e7')
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
      later(tick, 280 + weekCount * 42 + 180)
    }

    return () => {
      stopped = true
      timers.forEach((id) => window.clearTimeout(id))
      timers.clear()
    }
  }, [started, cells, graphWidth, weekCount])

  const labels = useMemo(() => monthLabels(cells), [cells])
  const live = source === 'live'
  const reducedMotion = prefersReducedMotion()

  return (
    <section id="github" ref={sectionRef} className="pb-20 md:pb-28 max-sm:hidden">
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
          className="w-full min-w-0 rounded-3xl border border-line bg-surface p-5 md:p-7"
        >
          <div ref={wrapRef} className="w-full min-w-0">
            <div ref={graphRef} className="git-graph w-full min-w-0">
              {graphWidth > 0 && (
                <svg
                  width={graphWidth}
                  height={height}
                  viewBox={`0 0 ${graphWidth} ${height}`}
                  preserveAspectRatio="xMinYMin meet"
                  className="block max-w-full"
                  style={{ width: '100%', height: 'auto' }}
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
                      x={item.week * (block + gap)}
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
                      x={cell.week * (block + gap)}
                      y={LABEL_H + cell.day * (block + gap)}
                      width={block}
                      height={block}
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
              )}
            </div>
          </div>

          <div className="mt-5 flex w-full min-w-0 flex-wrap items-center justify-between gap-4">
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
