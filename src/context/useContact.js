import { useContext } from 'react'
import { ContactContext } from './contact-context'

export function useContact() {
  const ctx = useContext(ContactContext)
  if (!ctx) {
    throw new Error('useContact must be used within ContactProvider')
  }
  return ctx
}
