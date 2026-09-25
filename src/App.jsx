import { lazy, Suspense } from 'react'
import { Navigate, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import ScrollToTop from './components/ScrollToTop'
import ContactBar from './components/ContactBar'
import IntroOverlay from './components/IntroOverlay'
import SmoothScroll from './components/SmoothScroll'
import { ContactProvider } from './context/ContactContext'
import { IntroProvider } from './context/IntroContext'
import Home from './pages/Home'
import SimRacingIndex from './pages/SimRacingIndex'
import ProjectDetail from './pages/ProjectDetail'

const ScrollDiagnostics = lazy(() => import('./components/ScrollDiagnostics'))
const showDiagnostics = new URLSearchParams(window.location.search).has('diag')

function App() {
  const location = useLocation()

  return (
    <ContactProvider>
      <IntroProvider>
        <SmoothScroll>
          <ScrollToTop />
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Home />} />
              <Route path="/sim-racing" element={<SimRacingIndex />} />
              <Route path="/sim-racing/:slug" element={<Navigate to="/sim-racing" replace />} />
              <Route path="/projects/:slug" element={<ProjectDetail />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
          <ContactBar />
          <IntroOverlay />
          {showDiagnostics && (
            <Suspense fallback={null}>
              <ScrollDiagnostics />
            </Suspense>
          )}
        </SmoothScroll>
      </IntroProvider>
    </ContactProvider>
  )
}

export default App
