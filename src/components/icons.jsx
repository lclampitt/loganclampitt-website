export function GitHubIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}

export function ArrowUpIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 19V5m0 0l-6 6m6-6l6 6" />
    </svg>
  )
}

export function SunIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <circle cx="12" cy="12" r="3.6" strokeWidth="1.8" />
      <path
        strokeLinecap="round"
        strokeWidth="1.8"
        d="M12 3.2v1.8M12 19v1.8M3.2 12h1.8M19 12h1.8M5.7 5.7l1.3 1.3M17 17l1.3 1.3M5.7 18.3 7 17M17 7l1.3-1.3"
      />
    </svg>
  )
}

export function MoonIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        d="M20 14.6A8.1 8.1 0 1 1 9.4 4 6.5 6.5 0 0 0 20 14.6Z"
      />
    </svg>
  )
}

export function ArrowDownIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 5v14m0 0l6-6m-6 6l-6-6" />
    </svg>
  )
}

export function CheckBadge({ className = '' }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-ink text-page ${className}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" className="w-[58%] h-[58%]" fill="none" stroke="currentColor" strokeWidth="3.2">
        <path d="M5 12.5l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}
