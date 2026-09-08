import { useEffect, useState } from 'react'
import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion'
import { CHAPTERS } from '../lib/chapters'
import { useIntro } from '../context/useIntro'
import { scrollToId } from '../lib/scroll'

export default function ChapterRail() {
  const { contentReady } = useIntro()
  const reduce = useReducedMotion()
  const [active, setActive] = useState('hero')
  const { scrollYProgress } = useScroll()
  const sprung = useSpring(scrollYProgress, {
    stiffness: reduce ? 400 : 140,
    damping: reduce ? 40 : 28,
    mass: 0.35,
  })
  const progress = reduce ? scrollYProgress : sprung

  useEffect(() => {
    if (!contentReady) return undefined

    const nodes = CHAPTERS
      .map((chapter) => document.getElementById(chapter.id))
      .filter(Boolean)

    if (!nodes.length) return undefined

    const ratios = new Map()
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          ratios.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0)
        })
        let next = CHAPTERS[0].id
        let best = -1
        CHAPTERS.forEach((chapter) => {
          const value = ratios.get(chapter.id) ?? 0
          if (value > best) {
            best = value
            next = chapter.id
          }
        })
        if (best > 0) setActive(next)
      },
      {
        rootMargin: '-18% 0px -48% 0px',
        threshold: [0, 0.12, 0.28, 0.5, 0.75, 1],
      },
    )

    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [contentReady])

  const jump = (id) => {
    scrollToId(id)
  }

  if (!contentReady) return null

  return (
    <>
      <motion.div
        className="chapter-progress"
        style={{ scaleX: progress }}
        aria-hidden="true"
      />
      <nav
        className="chapter-rail"
        aria-label="Page chapters"
      >
        <ol>
          {CHAPTERS.map((chapter) => {
            const isActive = chapter.id === active
            return (
              <li key={chapter.id}>
                <button
                  type="button"
                  onClick={() => jump(chapter.id)}
                  aria-current={isActive ? 'true' : undefined}
                  className={isActive ? 'is-active' : undefined}
                >
                  <span className="chapter-rail-dot" aria-hidden="true" />
                  <span className="chapter-rail-label">{chapter.label}</span>
                </button>
              </li>
            )
          })}
        </ol>
      </nav>
    </>
  )
}
