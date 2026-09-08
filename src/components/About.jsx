import { motion } from 'framer-motion'
import { ABOUT_FACTS } from '../data/content'
import { fadeUp } from '../lib/motion'

export default function About() {
  return (
    <section id="about" className="pb-24 md:pb-32">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <motion.h2
          {...fadeUp(0)}
          className="font-display text-sm tracking-[0.22em] uppercase text-muted mb-8"
        >
          About
        </motion.h2>

        <div className="grid lg:grid-cols-[1.4fr_0.8fr] gap-6 md:gap-8 items-start">
          <motion.div {...fadeUp(0.05)} className="box-dotted p-6 md:p-8">
            <p className="font-display text-2xl md:text-3xl font-semibold text-ink leading-snug">
              I build websites and apps that look and feel good to use.
            </p>
            <p className="mt-5 text-muted leading-relaxed">
              Computer Science graduate from CSU Fullerton. Software developer at CT Realty Trust, contributing to the public site including marketing pages and portfolio presentation.
            </p>
            <p className="mt-4 text-muted leading-relaxed">
              I also take on freelance and personal work, from storefronts to full stack experiments. Open to roles and client projects.
            </p>
          </motion.div>

          <motion.aside
            {...fadeUp(0.1)}
            className="box-dotted p-6 md:p-7"
          >
            <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-dim mb-4">
              Quick facts
            </p>
            <ul className="divide-y divide-line">
              {ABOUT_FACTS.map((fact) => (
                <li key={fact.label} className="flex items-baseline justify-between gap-4 py-3">
                  <span className="text-sm text-dim">{fact.label}</span>
                  <span className="text-sm text-ink text-right">{fact.value}</span>
                </li>
              ))}
            </ul>
          </motion.aside>
        </div>
      </div>
    </section>
  )
}
