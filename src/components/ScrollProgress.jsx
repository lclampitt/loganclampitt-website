import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion'
import { useIntro } from '../context/useIntro'

export default function ScrollProgress() {
  const { contentReady } = useIntro()
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const sprung = useSpring(scrollYProgress, {
    stiffness: reduce ? 400 : 140,
    damping: reduce ? 40 : 28,
    mass: 0.35,
  })
  const progress = reduce ? scrollYProgress : sprung

  if (!contentReady) return null

  return (
    <motion.div
      className="scroll-progress"
      style={{ scaleX: progress }}
      aria-hidden="true"
    />
  )
}
