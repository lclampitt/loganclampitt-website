import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { gpcOn, isExcluded, setExcluded } from '../lib/analytics'

const backLink = 'font-mono text-[13px] text-muted hover:text-ink transition-colors'
const label = 'mb-4 font-dot font-black text-[14px] tracking-[0.14em] uppercase text-muted'
const item = 'flex items-start gap-3 font-mono text-[13px] leading-relaxed text-muted'

// What the site keeps and never keeps. Must match api/events.js and the
// events table: a new stored field means a new line here.
const KEPT = [
  'Pages viewed, and which project, resume or link was opened.',
  'That the contact form was opened or sent. Never what it said.',
  'A random id stored in this browser, so a return visit counts once.',
  'When each visit happened, and where it came from, such as LinkedIn.',
  'City, region and country, from the network.',
  'Device, browser, operating system and window size.',
  'Whether the visit looks like a crawler, judged without keeping your address.',
]
const NEVER = [
  'Your IP address.',
  'Cookies. None are set.',
  'What you write in the contact form. Formspree delivers it to me.',
  'Anything shared with advertisers or other third parties.',
]

function List({ items }) {
  return (
    <ul className="flex flex-col gap-3">
      {items.map((text) => (
        <li key={text} className={item}>
          <span className="spec-tick mt-[7px] shrink-0" aria-hidden="true" />
          {text}
        </li>
      ))}
    </ul>
  )
}

export default function Privacy() {
  const gpc = gpcOn()
  const [excluded, setExcludedState] = useState(isExcluded)
  const [failed, setFailed] = useState(false)

  const toggle = () => {
    const next = !excluded
    const ok = setExcluded(next)
    setFailed(!ok)
    if (ok) setExcludedState(next)
  }

  let status = 'Visits from this browser are counted.'
  if (gpc) status = 'Your browser sends Global Privacy Control, so nothing is counted.'
  else if (excluded) status = 'Visits from this browser are not counted.'

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="min-h-screen pt-12 md:pt-16 pb-32"
    >
      <div className="mx-auto max-w-4xl px-5 md:px-8">
        <Link to="/" className={backLink}>
          ← Back home
        </Link>

        <div className="project-card mt-8 p-6 md:p-8">
          <h1 className="font-mono text-3xl md:text-4xl font-semibold text-ink">Privacy</h1>
          <p className="mt-5 max-w-[46rem] font-mono text-[13px] md:text-sm leading-relaxed text-muted">
            This site counts its own visits, so I can see what people read. Nothing goes to an ad network or
            an analytics company.
          </p>

          <div className="my-7 border-t border-dashed border-line" />
          <p className={label}>What is kept</p>
          <List items={KEPT} />

          <div className="my-7 border-t border-dashed border-line" />
          <p className={label}>What is never kept</p>
          <List items={NEVER} />

          <div className="my-7 border-t border-dashed border-line" />
          <p className={label}>Your choice</p>
          <p className="max-w-[46rem] font-mono text-[13px] leading-relaxed text-muted">
            If your browser sends Global Privacy Control, nothing is counted. You can also stop counting on
            this browser here.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <button type="button" onClick={toggle} disabled={gpc} className="soft-pill disabled:opacity-50">
              {excluded ? 'Count my visits again' : "Don't count my visits"}
            </button>
            <p className="font-mono text-[13px] text-ink" role="status">
              {failed ? 'This browser blocks storage, so the choice could not be saved.' : status}
            </p>
          </div>
        </div>
      </div>
    </motion.main>
  )
}
