import { createContext } from 'react'

export const THEME_STORAGE_KEY = 'logan-theme'

export const ThemeContext = createContext(null)

export function applyTheme(theme) {
  const next = theme === 'dark' ? 'dark' : 'light'
  document.documentElement.dataset.theme = next
  document.documentElement.style.colorScheme = next
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.content = next === 'dark' ? '#000000' : '#faf7f2'
}

export function readStoredTheme() {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY)
    if (value === 'dark' || value === 'light') return value
  } catch {
    // Private mode or blocked storage.
  }
  return 'light'
}
