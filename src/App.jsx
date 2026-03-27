import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import SimRacingDetail from './pages/SimRacingDetail'
import ProjectDetail from './pages/ProjectDetail'

function App() {
  const location = useLocation()

  return (
    <>
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/sim-racing/:slug" element={<SimRacingDetail />} />
          <Route path="/projects/:slug" element={<ProjectDetail />} />
        </Routes>
      </AnimatePresence>
    </>
  )
}

export default App
