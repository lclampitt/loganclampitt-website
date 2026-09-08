import { Link, useLocation } from 'react-router-dom'
import { LINKS } from '../data/content'
import { GitHubIcon } from './icons'
import { scrollToId } from '../lib/scroll'

const NAV = [
  { label: 'Projects', href: '/#projects' },
  { label: 'About', href: '/#about' },
]

export default function Navbar() {
  const location = useLocation()
  const isHome = location.pathname === '/'

  const handleNavClick = (event, href) => {
    if (isHome && href.startsWith('/#')) {
      event.preventDefault()
      scrollToId(href.slice(2))
    }
  }

  if (isHome) return null

  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-page pr-28 md:pr-36">
      <nav className="mx-auto max-w-6xl px-5 md:px-8 h-16 flex items-center justify-between">
        <Link
          to="/"
          className="text-ink/80 text-[15px] tracking-tight hover:text-ink transition-colors"
        >
          <span className="text-muted">@code by</span>{' '}
          <span className="font-display font-semibold text-ink">LOGAN</span>
        </Link>

        <ul className="flex items-center gap-6 md:gap-8 text-sm">
          {NAV.map(({ label, href }) => (
            <li key={label}>
              <Link
                to={href}
                onClick={(event) => handleNavClick(event, href)}
                className="text-muted hover:text-ink transition-colors"
              >
                {label}
              </Link>
            </li>
          ))}
          <li>
            <a
              href={LINKS.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-muted hover:text-ink transition-colors"
              aria-label="GitHub"
            >
              <span className="hidden sm:inline">GH</span>
              <GitHubIcon className="w-4 h-4 sm:hidden" />
            </a>
          </li>
        </ul>
      </nav>
    </header>
  )
}
