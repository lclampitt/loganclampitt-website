import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { LINKS } from '../data/content'
import { useIntro } from '../context/useIntro'
import {
  HANDLE_GLYPH_CLASS,
  LOGAN_GLYPH_CLASS,
  WORDMARK_ROW_CLASS,
} from '../lib/wordmark'

const LOGAN_TEXT = 'LOGAN'
const HANDLE_TEXT = `/@${LINKS.githubHandle}`
const EASE = [0.22, 1, 0.36, 1]

function wait(ms, signal) {
  return new Promise((resolve) => {
    if (signal?.aborted) {
      resolve()
      return
    }
    const id = window.setTimeout(resolve, ms)
    const onAbort = () => {
      window.clearTimeout(id)
      resolve()
    }
    signal?.addEventListener('abort', onAbort, { once: true })
  })
}

function Caret() {
  return <span className="intro-caret" aria-hidden="true" />
}

function IntroSequence() {
  const { phase, skip, startMorph, finish } = useIntro()
  const blockRef = useRef(null)
  const [logan, setLogan] = useState('')
  const [handle, setHandle] = useState('')
  const [showCaret, setShowCaret] = useState(true)
  const [fly, setFly] = useState(null)

  useEffect(() => {
    const ctrl = new AbortController()
    const { signal } = ctrl

    const typeChars = async (text, setter, perChar) => {
      for (const char of text) {
        if (signal.aborted) return
        await wait(perChar, signal)
        if (signal.aborted) return
        setter((value) => value + char)
      }
    }

    const run = async () => {
      try {
        if (document.fonts?.ready) await document.fonts.ready
      } catch {
        // Fonts API can fail in private contexts. Continue anyway.
      }
      await wait(90, signal)
      if (signal.aborted) return

      await typeChars(LOGAN_TEXT, setLogan, 48)
      if (signal.aborted) return
      await wait(80, signal)
      if (signal.aborted) return

      await typeChars(HANDLE_TEXT, setHandle, 30)
      if (signal.aborted) return
      await wait(120, signal)
      if (signal.aborted) return

      setShowCaret(false)
      await wait(40, signal)
      if (signal.aborted) return

      await new Promise((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(resolve))
      })
      if (signal.aborted) return

      const source = blockRef.current?.getBoundingClientRect()
      const target = document.getElementById('hero-wordmark')?.getBoundingClientRect()
      if (!source || !target || source.width < 1 || target.width < 1) {
        finish()
        return
      }

      startMorph()
      setFly({
        x: target.left - source.left,
        y: target.top - source.top,
        scaleX: target.width / source.width,
        scaleY: target.height / source.height,
      })
    }

    run()
    return () => ctrl.abort()
  }, [finish, startMorph])

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') skip()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [skip])

  const typingHandle = handle.length > 0
  const typingLogan = logan.length > 0 && !typingHandle

  return (
    <div className="fixed inset-0 z-[80]">
      <motion.div
        className="absolute inset-0 bg-page"
        initial={{ opacity: 1 }}
        animate={{ opacity: phase === 'morph' ? 0 : 1 }}
        transition={{ duration: 0.42, ease: EASE }}
      />

      <button
        type="button"
        className="absolute inset-0 z-10 cursor-pointer"
        aria-label="Skip introduction"
        onClick={skip}
      />

      <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center px-5">
        <motion.div
          ref={blockRef}
          className={WORDMARK_ROW_CLASS}
          style={{ originX: 0, originY: 0 }}
          initial={false}
          animate={fly ?? { x: 0, y: 0, scaleX: 1, scaleY: 1 }}
          transition={{ duration: 0.52, ease: EASE }}
          onAnimationComplete={() => {
            if (fly) finish()
          }}
        >
          <span className={LOGAN_GLYPH_CLASS}>
            {logan}
            {showCaret && typingLogan ? <Caret /> : null}
            {showCaret && logan.length === 0 ? <Caret /> : null}
          </span>
          {typingHandle ? (
            <span className={HANDLE_GLYPH_CLASS}>
              {handle}
              {showCaret ? <Caret /> : null}
            </span>
          ) : null}
        </motion.div>
      </div>

      {phase !== 'morph' ? (
        <p className="absolute bottom-8 inset-x-0 z-20 text-center font-mono text-[11px] tracking-[0.16em] uppercase text-dim pointer-events-none">
          click to skip
        </p>
      ) : null}
    </div>
  )
}

export default function IntroOverlay() {
  const { playing } = useIntro()
  if (!playing) return null
  return <IntroSequence />
}
