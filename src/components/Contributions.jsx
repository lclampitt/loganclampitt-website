import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { LINKS } from '../data/content'
import { fadeUp } from '../lib/motion'

const WEEKS = 53
const DAYS = 7
const LEVEL_COLORS = ['#18181b', '#3f3110', '#6d5414', '#a37d14', '#d4a017']

function seededLevel(week, day) {
  const n = (week * 17 + day * 31 + 11) % 23
  if (n > 18) return 4
  if (n > 14) return 3
  if (n > 10) return 2
  if (n > 6) return 1
  return 0
}

function buildMockCells() {
  const cells = []
  for (let week = 0; week < WEEKS; week += 1) {
    for (let day = 0; day < DAYS; day += 1) {
      cells.push({ week, day, level: seededLevel(week, day) })
    }
  }
  return cells
}

function parseContributions(payload) {
  const list = payload?.contributions
  if (!Array.isArray(list) || list.length === 0) return null

  const last = list.slice(-WEEKS * DAYS)
  if (last.every((item) => !item.count && !item.level)) return null

  return last.map((item, index) => ({
    week: Math.floor(index / DAYS),
    day: index % DAYS,
    level: Math.max(0, Math.min(4, item.level ?? (item.count > 8 ? 4 : item.count > 4 ? 3 : item.count > 1 ? 2 : item.count > 0 ? 1 : 0))),
  }))
}

export default function Contributions() {
  const mockCells = useMemo(() => buildMockCells(), [])
  const [cells, setCells] = useState(mockCells)
  const [live, setLive] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${LINKS.githubHandle}`)
        if (!res.ok) return
        const data = await res.json()
        const parsed = parseContributions(data)
        if (!cancelled && parsed) {
          setCells(parsed)
          setLive(true)
        }
      } catch {
        // Keep the labeled stylized map.
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

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
            className="grid w-max min-w-full gap-[3px]"
            style={{
              gridTemplateColumns: `repeat(${WEEKS}, 11px)`,
              gridTemplateRows: `repeat(${DAYS}, 11px)`,
              gridAutoFlow: 'column',
            }}
            role="img"
            aria-label={live ? 'GitHub contribution heatmap for the last year' : 'Stylized GitHub style contribution heatmap'}
          >
            {cells.map((cell, index) => (
              <span
                key={`${cell.week}-${cell.day}-${index}`}
                className="block w-[11px] h-[11px] rounded-[2px]"
                style={{ backgroundColor: LEVEL_COLORS[cell.level] }}
              />
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between gap-4">
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
