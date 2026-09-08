import { useTheme } from '../context/useTheme'

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDark}
      className="fixed top-3 right-3 md:top-4 md:right-5 z-[90] inline-flex items-center gap-2 rounded-full border border-line bg-raised pl-1.5 pr-3 py-1.5 text-ink shadow-bar"
    >
      <span className="w-5 h-5 rounded-full bg-accent shrink-0" aria-hidden="true" />
      <span className="font-mono text-[11px] tracking-[0.08em]">
        <span className="sm:hidden">{isDark ? 'Dark' : 'Light'}</span>
        <span className="hidden sm:inline">{isDark ? 'Dark' : 'Light · default'}</span>
      </span>
    </button>
  )
}
