import { useEffect } from 'react'
import { ReactLenis, useLenis } from 'lenis/react'
import { useContact } from '../context/useContact'
import { useIntro } from '../context/useIntro'
import { bindLenis } from '../lib/scroll'
import 'lenis/dist/lenis.css'

const OPTIONS = {
  autoRaf: true,
  lerp: 0.1,
  wheelMultiplier: 0.88,
  anchors: true,
  syncTouch: false,
  respectReducedMotion: true,
  autoToggle: true,
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
  return (
    <ReactLenis root options={OPTIONS}>
      <LenisBridge />
      {children}
    </ReactLenis>
  )
}
