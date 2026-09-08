import { motion } from 'framer-motion'
import { LINKS } from '../data/content'
import { useContact } from '../context/useContact'
import { useIntro } from '../context/useIntro'
import {
  HANDLE_GLYPH_CLASS,
  LOGAN_GLYPH_CLASS,
  WORDMARK_STACK_CLASS,
} from '../lib/wordmark'
import ActivityStrip from './ActivityStrip'

const fade = (delay) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] },
})

const ghostBtn =
  'inline-flex items-center justify-center rounded-xl border border-ink/25 px-4 py-2 text-sm text-ink hover:border-ink/60 hover:text-ink transition-colors'
const amberBtn =
  'inline-flex items-center justify-center rounded-xl border border-amber px-4 py-2 text-sm text-amber hover:bg-amber hover:text-page transition-colors'
const pill =
  'inline-flex items-center justify-center rounded-full border border-line bg-raised px-4 py-1.5 text-sm text-ink hover:border-ink/40 transition-colors'

export default function Hero() {
  const { openContact } = useContact()
  const { contentReady, playRequested, wordmarkReady } = useIntro()

  const scrollToProjects = () => {
    const el = document.getElementById('projects')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const rest = (delay) => {
    if (!contentReady) {
      return {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 0, y: 10 },
        transition: { duration: 0 },
      }
    }
    return fade(playRequested ? Math.min(delay, 0.14) : delay)
  }

  return (
    <section id="hero" className="relative pt-8 md:pt-10 pb-8 md:pb-10">
      <div className="mx-auto max-w-6xl px-5 md:px-8 w-full">
        <motion.div {...rest(0)} className="flex items-baseline justify-between gap-4">
          <p className="font-script italic text-[1.35rem] md:text-[1.65rem] text-ink">
            Hey it&apos;s me
          </p>
          <button
            type="button"
            onClick={scrollToProjects}
            className="font-mono text-[11px] tracking-[0.16em] uppercase text-dim hover:text-ink transition-colors"
          >
            scroll for work ↓
          </button>
        </motion.div>

        <h1 className="mt-6 md:mt-7">
          <span
            id="hero-wordmark"
            className={WORDMARK_STACK_CLASS}
            style={{ visibility: wordmarkReady ? 'visible' : 'hidden' }}
          >
            <span className={LOGAN_GLYPH_CLASS}>LOGAN</span>
            <span className={HANDLE_GLYPH_CLASS}>/@{LINKS.githubHandle}</span>
          </span>
        </h1>

        <motion.p
          {...rest(0.12)}
          className="mt-5 max-w-2xl font-mono text-[13px] md:text-sm leading-relaxed text-muted"
        >
          <span className="text-ink font-medium">Software Developer</span>
          {' '}
          at CT Realty Trust. I build websites and apps that look and feel good to use,
          {' '}
          <span className="text-ink font-medium">full stack</span>
          {' '}
          for the web. Open to
          {' '}
          <span className="text-ink font-medium">roles</span>
          {' '}
          and
          {' '}
          <span className="text-ink font-medium">freelance</span>
          . Quietly into sim racing on the side.
        </motion.p>

        <motion.div {...rest(0.18)} className="mt-6 flex flex-wrap items-center gap-2.5">
          <button type="button" onClick={openContact} className={ghostBtn}>
            Email me
          </button>
          <a
            href={LINKS.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className={ghostBtn}
          >
            LinkedIn
          </a>
          <button type="button" onClick={scrollToProjects} className={amberBtn}>
            See projects
          </button>
        </motion.div>

        <motion.div {...rest(0.24)} className="mt-8">
          <ActivityStrip />
        </motion.div>

        <motion.div {...rest(0.3)} className="mt-6">
          <p className="font-mono text-[13px] text-muted mb-3">
            You can check these <span className="text-ink">links</span> if you wish to
          </p>
          <div className="flex flex-wrap gap-2">
            <a href={LINKS.github} target="_blank" rel="noopener noreferrer" className={pill}>
              GitHub
            </a>
            <a href={LINKS.linkedin} target="_blank" rel="noopener noreferrer" className={pill}>
              LinkedIn
            </a>
            <a href={LINKS.resume} download className={pill}>
              Resume
            </a>
            <button type="button" onClick={openContact} className={pill}>
              open to work
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
