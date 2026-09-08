import { useTheme } from '../context/useTheme'
import { MoonIcon, SunIcon } from './icons'

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDark}
      className="fixed top-3 right-3 md:top-4 md:right-5 z-[90] inline-flex h-10 w-10 items-center justify-center box-dotted text-ink"
    >
      {isDark ? <MoonIcon /> : <SunIcon />}
    </button>
  )
}
