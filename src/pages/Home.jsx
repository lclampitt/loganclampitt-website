import { motion } from 'framer-motion'
import Hero from '../components/Hero'
import About from '../components/About'
import Services from '../components/Services'
import SimRacing from '../components/SimRacing'
import Projects from '../components/Projects'
import Contact from '../components/Contact'
import Footer from '../components/Footer'

export default function Home() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <Hero />
      <About />
      <Services />
      <Projects />
      <SimRacing />
      <Contact />
      <Footer />
    </motion.div>
  )
}
