import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar'
import ScrollToTop from './components/ScrollToTop'
import ContactBar from './components/ContactBar'
import { ContactProvider } from './context/ContactContext'
import Home from './pages/Home'
import SimRacingDetail from './pages/SimRacingDetail'
import SimRacingIndex from './pages/SimRacingIndex'
import ProjectDetail from './pages/ProjectDetail'

function App() {
  const location = useLocation()

  return (
    <ContactProvider>
      <ScrollToTop />
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
    </ContactProvider>
  )
}

export default App
