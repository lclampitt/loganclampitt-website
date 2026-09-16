import { lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import About from '../components/About'
import Hero from '../components/Hero'
import Experience from '../components/Experience'
import Projects, { SimRacingTeaser } from '../components/Projects'
import { useIntro } from '../context/useIntro'

const Footer = lazy(() => import('../components/Footer'))

export default function Home() {
  const { contentReady, playRequested } = useIntro()

  return (
    <motion.div
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <Hero />
      <motion.div
        initial={{ opacity: 0, y: playRequested ? 18 : 12 }}
        animate={{
          opacity: contentReady ? 1 : 0,
          y: contentReady ? 0 : playRequested ? 18 : 12,
        }}
        transition={{
          duration: 0.5,
          delay: playRequested && contentReady ? 0.46 : 0.06,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <SimRacingTeaser />
        <About />
        <Experience />
        <Projects />
        <Suspense fallback={null}>
          <Footer />
        </Suspense>
      </motion.div>
    </motion.div>
  )
}
