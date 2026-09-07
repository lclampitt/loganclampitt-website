import { motion } from 'framer-motion'
import { EXPERIENCE } from '../data/content'
import { fadeUp } from '../lib/motion'

export default function Experience() {
  return (
    <section id="experience" className="pb-20 md:pb-28">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <motion.h2
          {...fadeUp(0)}
          className="font-display text-sm tracking-[0.22em] uppercase text-muted mb-8"
        >
          Experience
        </motion.h2>

        <div className="flex flex-col gap-4">
          {EXPERIENCE.map((item, index) => (
            <motion.article
              key={item.title}
              {...fadeUp(index * 0.06)}
              className="rounded-3xl border border-line bg-surface p-5 md:p-6"
            >
              <div className="flex gap-4">
                <div
                  className="w-12 h-12 rounded-2xl bg-raised border border-line flex items-center justify-center font-display text-amber text-sm font-semibold shrink-0"
                  aria-hidden="true"
                >
                  {item.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <h3 className="font-display text-lg font-semibold text-ink">
                        {item.title}
                        <span className="text-muted font-normal"> · {item.role}</span>
                      </h3>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-dim border border-line rounded-full px-2 py-0.5">
                        {item.badge}
                      </span>
                    </div>
                    <p className="font-mono text-xs text-dim shrink-0">{item.dates}</p>
                  </div>
                  <p className="mt-3 text-sm text-muted leading-relaxed">{item.desc}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.chips.map((chip) => (
                      <span
                        key={chip}
                        className="rounded-full border border-line bg-raised px-3 py-1 text-xs text-muted"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
