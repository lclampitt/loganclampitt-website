import { lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import Hero from '../components/Hero'
import Projects from '../components/Projects'

const Experience = lazy(() => import('../components/Experience'))
const Skills = lazy(() => import('../components/Skills'))
const Contributions = lazy(() => import('../components/Contributions'))
const About = lazy(() => import('../components/About'))
const Footer = lazy(() => import('../components/Footer'))

export default function Home() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <Hero />
      <Projects />
      <Suspense fallback={null}>
        <Experience />
        <Skills />
        <Contributions />
        <About />
        <Footer />
      </Suspense>
    </motion.div>
  )
}
