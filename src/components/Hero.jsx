import { motion } from 'framer-motion'
import { LINKS } from '../data/content'
import { useContact } from '../context/useContact'
import { useIntro } from '../context/useIntro'
import { scrollToId } from '../lib/scroll'
import {
  HANDLE_GLYPH_CLASS,
  LOGAN_GLYPH_CLASS,
  WORDMARK_STACK_CLASS,
} from '../lib/wordmark'
import ActivityStrip from './ActivityStrip'

const fade = (delay) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] },
})

const ghostBtn =
  'box-dotted inline-flex items-center justify-center px-4 py-2 text-sm text-ink hover:border-ink/70 transition-colors'
const accentBtn =
  'box-dotted-accent inline-flex items-center justify-center px-4 py-2 text-sm hover:opacity-90 transition-opacity'
const solidBtn =
  'box-dotted-navy inline-flex items-center justify-center px-4 py-2 text-sm hover:opacity-90 transition-opacity'
const chip =
  'box-dotted inline-flex items-center justify-center px-4 py-1.5 text-sm text-ink hover:border-ink/40 transition-colors'

export default function Hero() {
  const { openContact } = useContact()
  const { contentReady, playRequested, wordmarkReady } = useIntro()

  const scrollToProjects = () => {
    scrollToId('projects')
  }

  const rest = (delay, introDelay = delay) => {
    if (!contentReady) {
      return {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 0, y: 12 },
        transition: { duration: 0 },
      }
    }
    return fade(playRequested ? introDelay : delay)
  }

  return (
    <>
      <section id="hero" className="relative pt-8 md:pt-10 pb-0">
        <div className="mx-auto max-w-6xl px-5 md:px-8 w-full">
          <motion.div {...rest(0, 0.04)} className="flex items-baseline justify-between gap-4 pr-24 sm:pr-32">
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
            {...rest(0.08, 0.1)}
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

          <motion.div {...rest(0.14, 0.18)} className="mt-6 flex flex-wrap items-center gap-2.5">
            <button type="button" onClick={openContact} className={ghostBtn}>
              Email me
            </button>
            <a
              href={LINKS.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className={accentBtn}
            >
              LinkedIn
            </a>
            <button type="button" onClick={scrollToProjects} className={solidBtn}>
              See projects
            </button>
          </motion.div>
        </div>
      </section>

      <section id="proof" className="relative pt-8 pb-8 md:pb-10">
        <div className="mx-auto max-w-6xl px-5 md:px-8 w-full">
          <motion.div {...rest(0.2, 0.28)}>
            <ActivityStrip />
          </motion.div>

          <motion.div {...rest(0.26, 0.38)} className="mt-6">
            <p className="font-mono text-[13px] text-muted mb-3">
              You can check these <span className="text-ink">links</span> if you wish to
            </p>
            <div className="flex flex-wrap gap-2">
              <a href={LINKS.github} target="_blank" rel="noopener noreferrer" className={chip}>
                GitHub
              </a>
              <a href={LINKS.linkedin} target="_blank" rel="noopener noreferrer" className={chip}>
                LinkedIn
              </a>
              <a href={LINKS.resume} download className={chip}>
                Resume
              </a>
              <button type="button" onClick={openContact} className={chip}>
                open to work
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
