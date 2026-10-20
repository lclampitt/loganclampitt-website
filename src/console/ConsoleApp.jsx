// The private /console. Lazy loaded from App.jsx, so visitors never
// download it, and rendered outside the site's chrome (no intro, no
// contact bar, no smooth scroll, no tracking).

import { useEffect, useState } from 'react'
import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import Behaviour from './Behaviour'
import Overview from './Overview'
import SignIn from './SignIn'
import Visitor from './Visitor'
import Visitors from './Visitors'
import { SIGNED_OUT_EVENT, readSession, signOut } from './session'

const NAV = [
  { to: '/console', label: 'Overview', end: true },
  { to: '/console/visitors', label: 'Visitors' },
  { to: '/console/behaviour', label: 'Behaviour' },
]

function useNoIndex() {
  useEffect(() => {
    const previous = document.title
    document.title = 'Console'
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    return () => {
      document.title = previous
      meta.remove()
    }
  }, [])
}

export default function ConsoleApp() {
  const [signedIn, setSignedIn] = useState(() => Boolean(readSession()))
  useNoIndex()

  useEffect(() => {
    const onSignedOut = () => setSignedIn(false)
    window.addEventListener(SIGNED_OUT_EVENT, onSignedOut)
    return () => window.removeEventListener(SIGNED_OUT_EVENT, onSignedOut)
  }, [])

  if (!signedIn) return <SignIn onSignedIn={() => setSignedIn(true)} />

  const navClass = ({ isActive }) =>
    `rounded-[7px] px-2.5 py-1.5 text-[13px] font-medium transition-colors ${
      isActive ? 'bg-cs-hover text-cs-ink' : 'text-cs-ink-2 hover:text-cs-ink'
    }`

  return (
    <div className="min-h-screen bg-cs-canvas font-console text-cs-ink md:grid md:grid-cols-[188px_minmax(0,1fr)]">
      <aside className="border-b border-cs-line bg-cs-surface px-4 py-3 md:sticky md:top-0 md:h-screen md:border-b-0 md:border-r md:py-5">
        <div className="flex items-center justify-between gap-3 md:block">
          <p className="text-[14px] font-bold tracking-[-0.02em]">Console</p>
          <button
            type="button"
            onClick={signOut}
            className="text-[12px] text-cs-ink-2 hover:text-cs-ink md:hidden"
          >
            Sign out
          </button>
        </div>
        <nav className="mt-2 flex gap-1 overflow-x-auto md:mt-5 md:flex-col" aria-label="Console">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={navClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button
          type="button"
          onClick={signOut}
          className="mt-6 hidden text-[12px] text-cs-ink-2 hover:text-cs-ink md:block"
        >
          Sign out
        </button>
      </aside>
      <main className="min-w-0 px-4 py-6 md:px-8 md:py-8">
        <div className="max-w-[1100px]">
          <Routes>
            <Route path="/console" element={<Overview />} />
            <Route path="/console/visitors" element={<Visitors />} />
            <Route path="/console/visitors/:n" element={<Visitor />} />
            <Route path="/console/behaviour" element={<Behaviour />} />
            <Route path="*" element={<Navigate to="/console" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}
