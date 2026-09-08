import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { motion } from 'framer-motion'
import { LINKS } from '../data/content'
import { useIntro } from '../context/useIntro'
import {
  HANDLE_GLYPH_CLASS,
  LOGAN_GLYPH_CLASS,
  WORDMARK_STACK_CLASS,
} from '../lib/wordmark'

const LOGAN_TEXT = 'LOGAN'
const HANDLE_TEXT = `/@${LINKS.githubHandle}`
const EASE = [0.22, 1, 0.36, 1]
const MORPH_MS = 640

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

function frames(count = 2) {
  return new Promise((resolve) => {
    const step = (left) => {
      if (left <= 0) {
        resolve()
        return
      }
      requestAnimationFrame(() => step(left - 1))
    }
    step(count)
  })
}

function typeDelay(min, max) {
  return min + Math.random() * (max - min)
}

async function typeInto(text, onChar, minDelay, maxDelay, signal) {
  for (let i = 0; i < text.length; i += 1) {
    await wait(typeDelay(minDelay, maxDelay), signal)
    if (signal.aborted) return
    onChar(text[i])
  }
}

function Caret() {
  return <span className="intro-caret" aria-hidden="true" />
}

function WordmarkStack({ logan, handle, loganCaret, handleCaret, sizer }) {
  return (
    <div className={`${WORDMARK_STACK_CLASS}${sizer ? ' invisible' : ''}`} aria-hidden={sizer ? true : undefined}>
      <span className={LOGAN_GLYPH_CLASS}>
        {logan}
        {loganCaret ? <Caret /> : null}
      </span>
      <span className={HANDLE_GLYPH_CLASS}>
        {handle}
        {handleCaret ? <Caret /> : null}
      </span>
    </div>
  )
}

function IntroSequence() {
  const { phase, skip, startMorph, finish } = useIntro()
  const blockRef = useRef(null)
  const [loganTyped, setLoganTyped] = useState('')
  const [handleTyped, setHandleTyped] = useState('')
  const [caretAt, setCaretAt] = useState('logan')
  const [showCaret, setShowCaret] = useState(true)
  const [pin, setPin] = useState(null)

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
        125,
        155,
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
        120,
        150,
        signal,
      )
      if (signal.aborted || handle !== HANDLE_TEXT) return

      await wait(260, signal)
      if (signal.aborted) return

      setShowCaret(false)
      await wait(80, signal)
      if (signal.aborted) return
      await frames(2)
      if (signal.aborted) return

      const node = blockRef.current
      const targetEl = document.getElementById('hero-wordmark')
      if (!node || !targetEl) {
        finish()
        return
      }

      const first = node.getBoundingClientRect()
      const last = targetEl.getBoundingClientRect()
      if (first.width < 1 || last.width < 1) {
        finish()
        return
      }

      flushSync(() => {
        setPin({
          left: first.left,
          top: first.top,
          width: first.width,
          height: first.height,
        })
      })
      startMorph()
      await frames(2)
      if (signal.aborted) return

      const latest = targetEl.getBoundingClientRect()
      const end = latest.width > 1 ? latest : last
      const dx = end.left - first.left
      const dy = end.top - first.top
      const sx = end.width / first.width
      const sy = end.height / first.height

      const flying = blockRef.current
      if (!flying || typeof flying.animate !== 'function') {
        finish()
        return
      }

      flying.style.transformOrigin = '0 0'
      const animation = flying.animate(
        [
          { transform: 'translate(0px, 0px) scale(1, 1)' },
          { transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})` },
        ],
        {
          duration: MORPH_MS,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          fill: 'forwards',
        },
      )

      try {
        await animation.finished
      } catch {
        // Animation was cancelled (skip / unmount).
      }
      if (signal.aborted) return
      finish()
    }

    run()
    return () => ctrl.abort()
  }, [finish, startMorph])

  useEffect(() => {
    if (phase === 'morph') return undefined
    const onKey = (event) => {
      if (event.key === 'Escape') skip()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, skip])

  const pinned = Boolean(pin)

  return (
    <div className="fixed inset-0 z-[80]">
      <motion.div
        className="absolute inset-0 bg-page"
        initial={false}
        animate={{ opacity: phase === 'morph' ? 0 : 1 }}
        transition={phase === 'morph' ? { duration: 0.52, ease: EASE } : { duration: 0 }}
      />

      {phase === 'morph' ? null : (
        <button
          type="button"
          className="absolute inset-0 z-10 cursor-pointer"
          aria-label="Skip introduction"
          onClick={skip}
        />
      )}

      <div
        className={
          pinned
            ? 'absolute inset-0 z-20 pointer-events-none'
            : 'absolute inset-0 z-20 pointer-events-none flex items-center justify-center px-5'
        }
      >
        <div
          ref={blockRef}
          className="relative"
          style={
            pin
              ? {
                  position: 'fixed',
                  left: pin.left,
                  top: pin.top,
                  width: pin.width,
                  height: pin.height,
                  margin: 0,
                  transformOrigin: '0 0',
                  zIndex: 21,
                  willChange: 'transform',
                }
              : undefined
          }
        >
          <WordmarkStack logan={LOGAN_TEXT} handle={HANDLE_TEXT} sizer />
          <div className="absolute left-0 top-0">
            <WordmarkStack
              logan={loganTyped}
              handle={handleTyped}
              loganCaret={showCaret && caretAt === 'logan'}
              handleCaret={showCaret && caretAt === 'handle'}
            />
          </div>
        </div>
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
