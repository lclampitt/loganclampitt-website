import { Fragment } from 'react'
import { motion } from 'framer-motion'
import { EXPERIENCE } from '../data/content'
import { fadeUp } from '../lib/motion'

export default function Experience() {
  return (
    <section id="experience" className="pb-20 md:pb-28">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="mx-auto w-full max-w-[52rem]">
          <motion.h2
            {...fadeUp(0)}
            className="font-display text-sm tracking-[0.22em] uppercase text-muted mb-8"
          >
            Experience
          </motion.h2>

          <ol className="timeline">
            {EXPERIENCE.map((item, index) => (
              <motion.li
                key={item.title}
                {...fadeUp(index * 0.06)}
                className={`timeline-entry${item.current ? ' is-current' : ''}`}
              >
                <p className="timeline-when">{item.dates}</p>
                <div className="timeline-rail" aria-hidden="true">
                  <span className="timeline-node" />
                </div>
                <div className="timeline-body">
                  <h3 className="font-display text-lg font-semibold leading-snug text-ink">
                    <span className="timeline-title">{item.title}</span>
                    <span className="font-medium text-muted"> · {item.role}</span>
                    {item.current && (
                      <span className="ml-2 align-[2px] font-mono text-[10px] font-medium tracking-[0.14em] uppercase text-accent">
                        Current
                      </span>
                    )}
                  </h3>
                  <p className="mt-2 max-w-[40rem] font-mono text-[13px] leading-relaxed text-muted">
                    {item.desc}
                  </p>
                  <p className="mt-2.5 font-mono text-[11px] tracking-[0.04em] text-dim">
                    {item.stack.map((tech, i) => (
                      <Fragment key={tech}>
                        {i > 0 && <span className="timeline-sep">/</span>}
                        {tech}
                      </Fragment>
                    ))}
                  </p>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
