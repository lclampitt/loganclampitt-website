import { Fragment } from 'react'
import { motion } from 'framer-motion'
import { ABOUT_SPEC } from '../data/content'
import { fadeUp } from '../lib/motion'

export default function About() {
  return (
    <section id="about" className="pb-20 md:pb-28">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="w-full">
          <motion.h2
            {...fadeUp(0)}
            className="font-dot font-black text-[17px] tracking-[0.14em] uppercase text-muted mb-8"
          >
            About
          </motion.h2>

          <motion.div {...fadeUp(0.05)} className="mb-9">
            <p className="max-w-[44rem] font-mono text-[13px] leading-[1.75] text-muted">
              Computer science grad from <strong className="font-semibold text-ink">CSU Fullerton</strong>,
              based in Southern California. I work across the stack, from the interface down to the
              database.
            </p>
          </motion.div>

          <motion.dl {...fadeUp(0.1)} className="spec">
            {ABOUT_SPEC.map((row) => (
              <div key={row.label} className="spec-item">
                <dt className="spec-label">
                  <span className="spec-tick" aria-hidden="true" />
                  {row.label}
                </dt>
                <dd className="spec-value">
                  {row.items.map((item, i) => (
                    <Fragment key={item}>
                      {i > 0 && <span className="timeline-sep">/</span>}
                      {item}
                    </Fragment>
                  ))}
                </dd>
              </div>
            ))}
          </motion.dl>
        </div>
      </div>
    </section>
  )
}
