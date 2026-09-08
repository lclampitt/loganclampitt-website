import { lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import Hero from '../components/Hero'
import Projects from '../components/Projects'
import { useIntro } from '../context/useIntro'

const Experience = lazy(() => import('../components/Experience'))
const Skills = lazy(() => import('../components/Skills'))
const About = lazy(() => import('../components/About'))
const Footer = lazy(() => import('../components/Footer'))

export default function Home() {
  const { contentReady, playRequested } = useIntro()

  return (
    <motion.div
      initial={playRequested ? { opacity: 0 } : { opacity: 0, y: 12 }}
      animate={{ opacity: contentReady ? 1 : 0, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <Hero />
      <Projects />
      <Suspense fallback={null}>
        <Experience />
        <Skills />
        <About />
        <Footer />
      </Suspense>
    </motion.div>
  )
}
