import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar'
import ScrollToTop from './components/ScrollToTop'
import ContactBar from './components/ContactBar'
import IntroOverlay from './components/IntroOverlay'
import ThemeToggle from './components/ThemeToggle'
import WaveCursor from './components/WaveCursor'
import { ContactProvider } from './context/ContactContext'
import { IntroProvider } from './context/IntroContext'
import Home from './pages/Home'
import SimRacingDetail from './pages/SimRacingDetail'
import SimRacingIndex from './pages/SimRacingIndex'
import ProjectDetail from './pages/ProjectDetail'

function App() {
  const location = useLocation()

  return (
    <ContactProvider>
      <IntroProvider>
        <ScrollToTop />
        <ThemeToggle />
        <WaveCursor />
        <Navbar />
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/sim-racing" element={<SimRacingIndex />} />
            <Route path="/sim-racing/:slug" element={<SimRacingDetail />} />
            <Route path="/projects/:slug" element={<ProjectDetail />} />
          </Routes>
        </AnimatePresence>
        <ContactBar />
        <IntroOverlay />
      </IntroProvider>
    </ContactProvider>
  )
}

export default App
