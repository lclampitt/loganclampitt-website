import { useCallback, useMemo, useState } from 'react'
import { ContactContext } from './contact-context'

export function ContactProvider({ children }) {
  const [open, setOpen] = useState(false)

  const openContact = useCallback(() => setOpen(true), [])
  const closeContact = useCallback(() => setOpen(false), [])
  const toggleContact = useCallback(() => setOpen((value) => !value), [])

  const value = useMemo(
    () => ({ open, setOpen, openContact, closeContact, toggleContact }),
    [open, openContact, closeContact, toggleContact],
  )

  return <ContactContext.Provider value={value}>{children}</ContactContext.Provider>
}
