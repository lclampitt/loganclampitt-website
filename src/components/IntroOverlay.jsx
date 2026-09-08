import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const STORAGE_KEY = 'logan-intro-seen'
const DRIVE_MS = 2000
const HOLD_MS = 320
const REDUCED_MS = 700

function RaceCar({ className = '', carRef }) {
  return (
    <svg
      ref={carRef}
      className={className}
      viewBox="0 0 220 72"
      fill="none"
      aria-hidden="true"
    >
      <ellipse cx="112" cy="67" rx="78" ry="3.2" fill="#000" opacity="0.45" />
      <path d="M28 46h164l-6 8H34z" fill="#18181b" />
      <path
        d="M18 44c3-9 12-16 22-18l22-1 14-12h58l22 12 28 2c10 1 18 8 20 16H18z"
        fill="#e4e4e7"
      />
      <path d="M34 38h154v5H32z" fill="#d4a017" />
      <path d="M76 26l12-10h52l16 12H78z" fill="#18181b" />
      <path d="M90 18h28v10H88z" fill="#27272a" />
      <path d="M186 28h16l6 10h-16z" fill="#a1a1aa" />
      <path d="M24 32l10-6 6 6H24z" fill="#a1a1aa" />
      <circle cx="58" cy="52" r="11" fill="#09090b" stroke="#a1a1aa" strokeWidth="2.2" />
      <circle cx="164" cy="52" r="11" fill="#09090b" stroke="#a1a1aa" strokeWidth="2.2" />
      <circle cx="58" cy="52" r="4" fill="#71717a" />
      <circle cx="164" cy="52" r="4" fill="#71717a" />
      <path d="M54 52h8M164 48v8" stroke="#52525b" strokeWidth="1.2" />
    </svg>
  )
}

function shouldPlayIntro() {
  try {
    return sessionStorage.getItem(STORAGE_KEY) !== '1'
  } catch {
    return true
  }
}

function markSeen() {
  try {
    sessionStorage.setItem(STORAGE_KEY, '1')
  } catch {
    // Private mode can block sessionStorage.
  }
}

function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function TireSmoke({ carRef, running }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!running) return undefined

    const canvas = canvasRef.current
    if (!canvas) return undefined

    const ctx = canvas.getContext('2d')
    if (!ctx) return undefined

    let particles = []
    let frameId = 0
    let last = performance.now()
    let width = 0
    let height = 0

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = canvas.clientWidth
      height = canvas.clientHeight
      canvas.width = Math.max(1, Math.floor(width * dpr))
      canvas.height = Math.max(1, Math.floor(height * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    let emitClock = 0
    const emit = (x, y, now) => {
      if (now - emitClock < 22) return
      emitClock = now
      for (let i = 0; i < 3; i += 1) {
        particles.push({
          x: x + Math.random() * 12,
          y: y + (Math.random() - 0.35) * 8,
          vx: -48 - Math.random() * 64,
          vy: -8 - Math.random() * 24,
          life: 1,
          decay: 0.011 + Math.random() * 0.01,
          r: 7 + Math.random() * 10,
          warm: Math.random() > 0.82,
        })
      }
    }

    const tick = (now) => {
      const dt = Math.min(0.033, (now - last) / 1000)
      last = now

      const car = carRef.current
      if (car && width) {
        const carBox = car.getBoundingClientRect()
        const stage = canvas.getBoundingClientRect()
        emit(
          carBox.left - stage.left + 16,
          carBox.top - stage.top + carBox.height - 18,
          now,
        )
      }

      ctx.clearRect(0, 0, width, height)
      const next = []
      for (const puff of particles) {
        puff.x += puff.vx * dt
        puff.y += puff.vy * dt
        puff.life -= puff.decay
        puff.r += 22 * dt
        if (puff.life <= 0) continue
        next.push(puff)
        ctx.beginPath()
        ctx.fillStyle = puff.warm
          ? `rgba(212, 160, 23, ${puff.life * 0.28})`
          : `rgba(212, 212, 216, ${puff.life * 0.48})`
        ctx.arc(puff.x, puff.y, puff.r, 0, Math.PI * 2)
        ctx.fill()
      }
      particles = next
      frameId = window.requestAnimationFrame(tick)
    }

    resize()
    window.addEventListener('resize', resize)
    frameId = window.requestAnimationFrame(tick)

    return () => {
      window.cancelAnimationFrame(frameId)
      window.removeEventListener('resize', resize)
    }
  }, [carRef, running])

  return <canvas ref={canvasRef} className="intro-smoke-canvas" aria-hidden="true" />
}

export default function IntroOverlay() {
  const [visible, setVisible] = useState(() => shouldPlayIntro())
  const [reduced] = useState(() => prefersReducedMotion())
  const carRef = useRef(null)

  const dismiss = () => {
    markSeen()
    setVisible(false)
  }

  useEffect(() => {
    if (!visible) return undefined

    document.body.style.overflow = 'hidden'
    const timer = window.setTimeout(dismiss, reduced ? REDUCED_MS : DRIVE_MS + HOLD_MS)
    const onKey = (event) => {
      if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        dismiss()
      }
    }
    window.addEventListener('keydown', onKey)

    return () => {
      document.body.style.overflow = ''
      window.clearTimeout(timer)
      window.removeEventListener('keydown', onKey)
    }
  }, [visible, reduced])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="intro-overlay"
          role="dialog"
          aria-label="Site intro. Click or press Escape to enter."
          aria-modal="true"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          onClick={dismiss}
        >
          <button type="button" className="intro-skip" onClick={dismiss}>
            Skip
          </button>

          {reduced ? (
            <div className="intro-reduced">
              <RaceCar className="intro-car-static" />
              <p className="intro-name">Logan Clampitt</p>
            </div>
          ) : (
            <div className="intro-stage">
              <p className="intro-name intro-name-live">Logan Clampitt</p>
              <div className="intro-track" aria-hidden="true" />
              <div className="intro-track-burn" aria-hidden="true" />
              <TireSmoke carRef={carRef} running={visible} />
              <div className="race-rig">
                <RaceCar className="race-car" carRef={carRef} />
              </div>
              <p className="intro-caption">Warming the tires · click to enter</p>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
