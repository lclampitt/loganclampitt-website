import { motion } from 'framer-motion'
import { useContact } from '../context/useContact'
import { CheckBadge } from './icons'

export default function Hero() {
  const { openContact } = useContact()

  const scrollToProjects = () => {
    const el = document.getElementById('projects')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="hero" className="relative min-h-[100svh] flex items-center pt-20 pb-28">
      <div className="mx-auto max-w-6xl px-5 md:px-8 w-full">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="font-display font-semibold text-[clamp(2.6rem,8vw,5.75rem)] leading-[0.95] text-ink max-w-5xl"
        >
          Hi I&apos;m Logan
          <CheckBadge className="ml-2 mr-1 w-[0.62em] h-[0.62em] align-middle -translate-y-[0.06em]" />
          I build
          <br />
          for the web.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 max-w-xl text-muted text-base md:text-lg leading-relaxed"
        >
          I build websites and apps that look and feel good to use. Developer and full stack builder, open to roles and freelance.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 flex flex-wrap items-center gap-3 md:gap-4"
        >
          <button
            type="button"
            onClick={scrollToProjects}
            className="rounded-xl bg-ink text-page px-5 py-2.5 text-sm font-medium hover:bg-white transition-colors"
          >
            See projects
          </button>
          <button
            type="button"
            onClick={openContact}
            className="rounded-xl border border-ink/25 text-ink px-5 py-2.5 text-sm font-medium hover:border-ink/60 transition-colors"
          >
            Start a project
          </button>
          <p className="w-full sm:w-auto sm:ml-3 text-sm text-dim">
            psst... I&apos;m <span className="text-amber">open to work</span>
          </p>
        </motion.div>
      </div>
    </section>
  )
}
