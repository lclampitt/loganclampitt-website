import { useContext } from 'react'
import { IntroContext } from './intro-context'

export function useIntro() {
  const ctx = useContext(IntroContext)
  if (!ctx) {
    throw new Error('useIntro must be used within IntroProvider')
  }
  return ctx
}
