import { useEffect } from 'react'
import { ReactLenis, useLenis } from 'lenis/react'
import { useContact } from '../context/useContact'
import { useIntro } from '../context/useIntro'
import { bindLenis } from '../lib/scroll'
import 'lenis/dist/lenis.css'

const MOUSE_LERP = 0.1
const TRACKPAD_LERP = 0.22

const OPTIONS = {
  autoRaf: true,
  lerp: MOUSE_LERP,
  wheelMultiplier: 1,
  smoothWheel: true,
  syncTouch: false,
  anchors: true,
  allowNestedScroll: true,
  respectReducedMotion: true,
  // Lenis calls this as options.virtualScroll(), so `this` is the live options object.
  virtualScroll(data) {
    if (data.event.type === 'wheel') {
      const small = Math.abs(data.deltaY) < 50 && Math.abs(data.deltaX) < 50
      this.lerp = small ? TRACKPAD_LERP : MOUSE_LERP
    }
    return true
  },
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
