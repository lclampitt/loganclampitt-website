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
    if (signal.aborted) return
    const id = window.setTimeout(() => {
      if (!signal.aborted) resolve()
    }, ms)
    signal.addEventListener(
      'abort',
      () => window.clearTimeout(id),
      { once: true },
    )
  })
}

function typeDelay(min, max) {
  return min + Math.random() * (max - min)
}

async function typeInto(text, onChar, minDelay, maxDelay, signal) {
  for (let i = 0; i < text.length; i += 1) {
    await wait(typeDelay(minDelay, maxDelay), signal)
    if (signal.aborted) return
    onChar(text[i], i + 1)
  }
}

function Caret() {
  return <span className="intro-caret" aria-hidden="true" />
}

function IntroSequence() {
  const { phase, skip, startMorph, finish } = useIntro()
  const blockRef = useRef(null)
  const [loganTyped, setLoganTyped] = useState('')
  const [handleTyped, setHandleTyped] = useState('')
  const [caretAt, setCaretAt] = useState('logan')
  const [showCaret, setShowCaret] = useState(true)
  const [fly, setFly] = useState(null)

  useEffect(() => {
    const ctrl = new AbortController()
    const { signal } = ctrl

    const run = async () => {
      try {
        if (document.fonts?.ready) await document.fonts.ready
      } catch {
        // Fonts API can fail in private contexts. Continue anyway.
      }
      if (signal.aborted) return

      await wait(240, signal)
      if (signal.aborted) return

      let logan = ''
      await typeInto(
        LOGAN_TEXT,
        (char) => {
          logan += char
          setCaretAt('logan')
          setLoganTyped(logan)
        },
        88,
        110,
        signal,
      )
      if (signal.aborted || logan !== LOGAN_TEXT) return

      await wait(360, signal)
      if (signal.aborted) return

      setCaretAt('handle')

      let handle = ''
      await typeInto(
        HANDLE_TEXT,
        (char) => {
          handle += char
          setCaretAt('handle')
          setHandleTyped(handle)
        },
        70,
        110,
        signal,
      )
      if (signal.aborted || handle !== HANDLE_TEXT) return

      await wait(280, signal)
      if (signal.aborted) return

      setShowCaret(false)
      await wait(80, signal)
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

  return (
    <div className="fixed inset-0 z-[80]">
      <motion.div
        className="absolute inset-0 bg-page"
        initial={false}
        animate={{ opacity: phase === 'morph' ? 0 : 1 }}
        transition={phase === 'morph' ? { duration: 0.42, ease: EASE } : { duration: 0 }}
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
          className="relative"
          style={{ originX: 0, originY: 0 }}
          initial={false}
          animate={fly ?? false}
          transition={fly ? { duration: 0.52, ease: EASE } : { duration: 0 }}
          onAnimationComplete={() => {
            if (fly) finish()
          }}
        >
          <div className={`${WORDMARK_ROW_CLASS} invisible`} aria-hidden="true">
            <span className={LOGAN_GLYPH_CLASS}>{LOGAN_TEXT}</span>
            <span className={HANDLE_GLYPH_CLASS}>{HANDLE_TEXT}</span>
          </div>
          <div className={`${WORDMARK_ROW_CLASS} absolute left-0 top-0`}>
            <span className={LOGAN_GLYPH_CLASS}>
              {loganTyped.split('').map((char, index) => (
                <span key={`logan-${index}`}>{char}</span>
              ))}
              {showCaret && caretAt === 'logan' ? <Caret /> : null}
            </span>
            {caretAt === 'handle' || handleTyped.length > 0 ? (
              <span className={HANDLE_GLYPH_CLASS}>
                {handleTyped.split('').map((char, index) => (
                  <span key={`handle-${index}`}>{char}</span>
                ))}
                {showCaret && caretAt === 'handle' ? <Caret /> : null}
              </span>
            ) : null}
          </div>
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
