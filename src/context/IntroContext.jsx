import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { INTRO_STORAGE_KEY, IntroContext } from './intro-context'

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function hasSeenIntro() {
  try {
    return sessionStorage.getItem(INTRO_STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

function markIntroSeen() {
  try {
    sessionStorage.setItem(INTRO_STORAGE_KEY, '1')
  } catch {
    // Private mode or blocked storage. Skip persistence.
  }
}

function shouldPlayIntro() {
  if (typeof window === 'undefined') return false
  if (prefersReducedMotion()) return false
  return !hasSeenIntro()
}

export function IntroProvider({ children }) {
  const location = useLocation()
  const [playRequested] = useState(shouldPlayIntro)
  const [phase, setPhase] = useState(playRequested ? 'typing' : 'done')

  const isHome = location.pathname === '/'
  const playing = Boolean(playRequested && isHome && phase !== 'done')

  const finish = useCallback(() => {
    markIntroSeen()
    setPhase('done')
  }, [])

  const skip = useCallback(() => {
    finish()
  }, [finish])

  const startMorph = useCallback(() => {
    setPhase((current) => (current === 'done' ? current : 'morph'))
  }, [])

  useEffect(() => {
    if (!playing) return undefined
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [playing])

  useEffect(() => {
    if (phase !== 'morph') return undefined
    const id = window.setTimeout(() => finish(), 1400)
    return () => window.clearTimeout(id)
  }, [finish, phase])

  const contentReady = !playing || phase === 'morph'
  const wordmarkReady = !playing

  const value = useMemo(
    () => ({
      playRequested,
      playing,
      phase,
      contentReady,
      wordmarkReady,
      skip,
      startMorph,
      finish,
    }),
    [contentReady, finish, phase, playRequested, playing, skip, startMorph, wordmarkReady],
  )

  return <IntroContext.Provider value={value}>{children}</IntroContext.Provider>
}
