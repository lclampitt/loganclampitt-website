import { motion } from 'framer-motion'
import { SKILLS } from '../data/content'
import { fadeUp } from '../lib/motion'

export default function Skills() {
  return (
    <section id="skills" className="pb-20 md:pb-28">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <motion.h2
          {...fadeUp(0)}
          className="font-display text-sm tracking-[0.22em] uppercase text-muted mb-8"
        >
          Skills
        </motion.h2>
        <motion.ul {...fadeUp(0.06)} className="flex flex-wrap gap-2.5">
          {SKILLS.map((skill) => (
            <li
              key={skill}
              className="box-dotted px-4 py-2.5 text-sm text-ink/90"
            >
              {skill}
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  )
}
