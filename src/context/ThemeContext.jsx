import { useCallback, useEffect, useMemo, useState } from 'react'
import { THEME_STORAGE_KEY, ThemeContext, applyTheme, readStoredTheme } from './theme-context'

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    if (typeof document === 'undefined') return 'dark'
    if (document.documentElement.dataset.theme === 'light') return 'light'
    return readStoredTheme()
  })

  useEffect(() => {
    applyTheme(theme)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch {
      // Private mode or blocked storage.
    }
  }, [theme])

  const setTheme = useCallback((next) => {
    setThemeState(next === 'dark' ? 'dark' : 'light')
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState((current) => (current === 'dark' ? 'light' : 'dark'))
  }, [])

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === 'dark',
      setTheme,
      toggleTheme,
    }),
    [setTheme, theme, toggleTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
