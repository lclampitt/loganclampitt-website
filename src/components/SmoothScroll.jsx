import { useEffect, useState } from 'react'
import { ReactLenis, useLenis } from 'lenis/react'
import { useContact } from '../context/useContact'
import { useIntro } from '../context/useIntro'
import { bindLenis } from '../lib/scroll'
import 'lenis/dist/lenis.css'

const FLOATY = {
  autoRaf: true,
  lerp: 0.08,
  wheelMultiplier: 0.9,
  syncTouch: false,
  anchors: true,
  allowNestedScroll: true,
  respectReducedMotion: true,
}

const NATIVE = {
  autoRaf: true,
  lerp: 1,
  wheelMultiplier: 1,
  syncTouch: false,
  anchors: true,
  respectReducedMotion: true,
}

function useScrollOptions() {
  const [options, setOptions] = useState(FLOATY)

  useEffect(() => {
    const coarse = window.matchMedia('(pointer: coarse)')
    const sync = () => setOptions(coarse.matches ? NATIVE : FLOATY)
    sync()
    coarse.addEventListener('change', sync)
    return () => coarse.removeEventListener('change', sync)
  }, [])

  return options
}

function LenisBridge() {
  const lenis = useLenis()
  const { playing } = useIntro()
  const { open } = useContact()

  useEffect(() => {
    bindLenis(lenis ?? null)
    return () => bindLenis(null)
  }, [lenis])

  useEffect(() => {
    if (!lenis) return undefined
    if (playing || open) lenis.stop()
    else lenis.start()
    return undefined
  }, [lenis, open, playing])

  return null
}

export default function SmoothScroll({ children }) {
  const options = useScrollOptions()

  return (
    <ReactLenis root options={options}>
      <LenisBridge />
      {children}
    </ReactLenis>
  )
}
