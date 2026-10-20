import { useCallback, useMemo, useState } from 'react'
import { ContactContext } from './contact-context'

// `openedFrom` says which control opened the panel ('email_me' for the
// hero button, 'contact_bar' for the bar), so the console can count the
// "Email me" button on its own.
export function ContactProvider({ children }) {
  const [open, setOpen] = useState(false)
  const [openedFrom, setOpenedFrom] = useState(null)

  // Used directly as an onClick handler, so a click event may arrive here.
  const openContact = useCallback((from) => {
    setOpenedFrom(typeof from === 'string' ? from : 'other')
    setOpen(true)
  }, [])
  const closeContact = useCallback(() => setOpen(false), [])
  const toggleContact = useCallback(() => {
    setOpenedFrom('contact_bar')
    setOpen((value) => !value)
  }, [])

  const value = useMemo(
    () => ({ open, openedFrom, setOpen, openContact, closeContact, toggleContact }),
    [open, openedFrom, openContact, closeContact, toggleContact],
  )

  return <ContactContext.Provider value={value}>{children}</ContactContext.Provider>
}
