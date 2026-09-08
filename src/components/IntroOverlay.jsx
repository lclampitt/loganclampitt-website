import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const STORAGE_KEY = 'logan-intro-seen'

function RaceCar({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 168 58"
      fill="none"
      aria-hidden="true"
    >
      <ellipse cx="84" cy="53" rx="62" ry="3.5" fill="#000" opacity="0.35" />
      <path
        d="M16 37c2-8 10-16 18-17h28l16-11h42l28 16h12v14H16z"
        fill="#e4e4e7"
      />
      <path d="M28 31h132v4H26z" fill="#d4a017" />
      <path d="M64 21l14-10h38l18 15H66z" fill="#18181b" />
      <path d="M80 13h18v10H78z" fill="#27272a" />
      <circle cx="46" cy="43" r="9" fill="#09090b" stroke="#a1a1aa" strokeWidth="2" />
      <circle cx="128" cy="43" r="9" fill="#09090b" stroke="#a1a1aa" strokeWidth="2" />
      <circle cx="46" cy="43" r="3" fill="#71717a" />
      <circle cx="128" cy="43" r="3" fill="#71717a" />
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

export default function IntroOverlay() {
  const [visible, setVisible] = useState(() => shouldPlayIntro())
  const reduced = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const dismiss = () => {
    markSeen()
    setVisible(false)
  }

  useEffect(() => {
    if (!visible) return undefined
    document.body.style.overflow = 'hidden'
    const ms = reduced ? 700 : 2100
    const timer = window.setTimeout(() => {
      markSeen()
      setVisible(false)
    }, ms)
    return () => {
      document.body.style.overflow = ''
      window.clearTimeout(timer)
    }
  }, [visible, reduced])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="intro-overlay"
          role="dialog"
          aria-label="Site intro"
          aria-modal="true"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <button type="button" className="intro-skip" onClick={dismiss}>
            Skip
          </button>

          {reduced ? (
            <div className="intro-reduced">
              <RaceCar className="w-40 h-auto" />
              <p className="font-display text-ink text-lg mt-4">Logan Clampitt</p>
            </div>
          ) : (
            <div className="intro-stage">
              <div className="race-rig">
                <div className="race-smoke" aria-hidden="true">
                  {Array.from({ length: 8 }, (_, index) => (
                    <span
                      key={index}
                      className="smoke-puff"
                      style={{ animationDelay: `${index * 90}ms` }}
                    />
                  ))}
                </div>
                <RaceCar className="race-car" />
              </div>
              <p className="intro-caption">Warming the tires</p>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
