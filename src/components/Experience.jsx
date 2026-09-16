import { Fragment, useEffect, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { EXPERIENCE } from '../data/content'
import { fadeUp } from '../lib/motion'

const STEP_MS = 550
const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const SCRAMBLE_FRAMES = 12

function ScrambleText({ text, play, delay }) {
  const [shown, setShown] = useState(text)

  useEffect(() => {
    if (!play) return undefined
    let interval = 0
    const timeout = window.setTimeout(() => {
      let frame = 0
      interval = window.setInterval(() => {
        frame += 1
        const settled = Math.floor((frame / SCRAMBLE_FRAMES) * text.length)
        setShown(
          [...text]
            .map((char, i) => (i < settled || !/[A-Za-z0-9]/.test(char)
              ? char
              : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]))
            .join(''),
        )
        if (frame >= SCRAMBLE_FRAMES) {
          window.clearInterval(interval)
          setShown(text)
        }
      }, 40)
    }, delay)
    return () => {
      window.clearTimeout(timeout)
      window.clearInterval(interval)
    }
  }, [delay, play, text])

  return <span aria-hidden="true">{shown}</span>
}

export default function Experience() {
  const listRef = useRef(null)
  const inView = useInView(listRef, { once: true, amount: 0.3 })
  const reducedMotion = useReducedMotion()
  const drawn = inView || reducedMotion

  return (
    <section id="experience" className="pb-20 md:pb-28">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="mx-auto w-full max-w-[52rem]">
          <motion.h2
            {...fadeUp(0)}
            className="font-dot font-black text-[17px] tracking-[0.14em] uppercase text-muted mb-8"
          >
            Experience
          </motion.h2>

          <ol ref={listRef} className={`timeline${drawn ? ' is-drawn' : ''}`}>
            {EXPERIENCE.map((item, index) => (
              <li
                key={item.title}
                className={`timeline-entry${item.current ? ' is-current' : ''}`}
                style={{ '--step': index }}
              >
                <p className="timeline-when">
                  <span className="sr-only">{item.dates}</span>
                  <ScrambleText
                    text={item.dates}
                    play={drawn && !reducedMotion}
                    delay={index * STEP_MS + 100}
                  />
                </p>
                <div className="timeline-rail" aria-hidden="true">
                  <span className="timeline-node" />
                </div>
                <div className="timeline-body">
                  <h3 className="font-mono text-[17px] font-semibold leading-snug text-ink">
                    <span className="timeline-title">{item.title}</span>
                    <span className="font-medium text-muted"> · {item.role}</span>
                    {item.current && (
                      <span className="ml-2 align-[2px] font-mono text-[10px] font-medium tracking-[0.14em] uppercase text-accent">
                        Current
                      </span>
                    )}
                  </h3>
                  <p className="mt-2 max-w-[40rem] font-mono text-[13px] leading-relaxed text-muted">
                    {item.desc}
                  </p>
                  <p className="mt-2.5 font-mono text-[11px] tracking-[0.04em] text-dim">
                    {item.stack.map((tech, i) => (
                      <Fragment key={tech}>
                        {i > 0 && <span className="timeline-sep">/</span>}
                        {tech}
                      </Fragment>
                    ))}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
