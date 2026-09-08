import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SIM_RACING } from '../data/content'
import { fadeUp } from '../lib/motion'

export default function SimRacingIndex() {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-28 pb-32"
    >
      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <Link to="/#projects" className="text-sm text-muted hover:text-ink transition-colors">
          ← Back to projects
        </Link>
        <motion.h1 {...fadeUp(0)} className="font-display text-4xl font-semibold mt-8">
          Sim racing
        </motion.h1>
        <motion.p {...fadeUp(0.05)} className="mt-4 text-muted leading-relaxed">
          8+ years competing in ENASCAR series. Personality, not a second portfolio.
        </motion.p>

        <div className="mt-10 flex flex-col gap-4">
          {SIM_RACING.map((item, index) => (
            <motion.div key={item.slug} {...fadeUp(0.08 + index * 0.05)}>
              <Link
                to={`/sim-racing/${item.slug}`}
                className="block box-dotted p-6 hover:border-ink/25 transition-colors"
              >
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-dim">{item.subtitle}</p>
                <h2 className="font-display text-xl font-semibold mt-2">{item.title}</h2>
                <p className="text-sm text-accent mt-4">Read more →</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.main>
  )
}
