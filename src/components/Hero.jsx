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
import DotPortrait from './DotPortrait'
import { GitHubIcon, LinkedInIcon, ResumeIcon, WorkIcon } from './icons'

const fade = (delay) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] },
})

const pill = 'soft-pill'

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
        <div className="mx-auto max-w-6xl px-5 md:px-8 w-full relative">
          <motion.div
            {...rest(0.12, 0.2)}
            transition={{ duration: 0.8, delay: playRequested ? 0.2 : 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="hidden md:block absolute top-[17px] right-[68px] z-10"
          >
            <DotPortrait />
          </motion.div>
          <motion.div {...rest(0, 0.04)} className="pr-24 sm:pr-32">
            <p className="font-dot font-black text-[1.75rem] md:text-[2.25rem] leading-none tracking-[0.02em] text-ink">
              hello, world
              <span className="greet-caret" aria-hidden="true">_</span>
            </p>
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
            <button type="button" onClick={openContact} className={pill}>
              Email me
            </button>
            <a
              href={LINKS.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className={pill}
            >
              LinkedIn
            </a>
            <button type="button" onClick={scrollToProjects} className={pill}>
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
              <a href={LINKS.github} target="_blank" rel="noopener noreferrer" className={pill}>
                <GitHubIcon />
                GitHub
              </a>
              <a href={LINKS.linkedin} target="_blank" rel="noopener noreferrer" className={pill}>
                <LinkedInIcon />
                LinkedIn
              </a>
              <a href={LINKS.resume} download className={pill}>
                <ResumeIcon />
                Resume
              </a>
              <button type="button" onClick={openContact} className={pill}>
                <WorkIcon />
                open to work
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
