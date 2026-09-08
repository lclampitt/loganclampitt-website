import { useEffect, useId, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FORMSPREE_ID, LINKS } from '../data/content'
import { useContact } from '../context/useContact'
import { useIntro } from '../context/useIntro'
import { ArrowDownIcon, ArrowUpIcon } from './icons'

const QUICK_LINKS = [
  { label: 'GitHub', value: LINKS.githubHandle, href: LINKS.github },
  { label: 'LinkedIn', value: LINKS.linkedinHandle, href: LINKS.linkedin },
  { label: 'Resume', value: 'PDF', href: LINKS.resume, download: true },
]

export default function ContactBar() {
  const { open, toggleContact, closeContact } = useContact()
  const { contentReady } = useIntro()
  const panelId = useId()
  const nameRef = useRef(null)
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(false)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (!open) return undefined

    const onKey = (event) => {
      if (event.key === 'Escape') closeContact()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    const timer = window.setTimeout(() => nameRef.current?.focus(), 180)

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      window.clearTimeout(timer)
    }
  }, [open, closeContact])

  const handleChange = (event) => {
    setFormData((prev) => ({ ...prev, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSending(true)
    setError(false)
    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        setSubmitted(true)
      } else {
        setError(true)
      }
    } catch {
      setError(true)
    } finally {
      setSending(false)
    }
  }

  const focusForm = () => {
    if (!open) {
      toggleContact()
    } else {
      nameRef.current?.focus()
    }
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.button
            type="button"
            aria-label="Close contact"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeContact}
            className="fixed inset-0 z-40 bg-page/70"
          />
        )}
      </AnimatePresence>

      <motion.div
        className="fixed inset-x-0 bottom-0 z-50 pointer-events-none"
        initial={false}
        animate={{ opacity: contentReady ? 1 : 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden={!contentReady}
      >
        <div className="mx-auto max-w-4xl px-4 pb-4 md:pb-6 flex flex-col items-center">
          <AnimatePresence>
            {open && (
              <motion.div
                id={panelId}
                role="dialog"
                aria-labelledby="contact-title"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="pointer-events-auto w-full mb-3 box-dotted p-5 md:p-8 max-h-[min(78vh,720px)] overflow-y-auto"
                data-lenis-prevent
              >
                <div className="grid md:grid-cols-[1.2fr_0.8fr] gap-8">
                  <div>
                    <h2 id="contact-title" className="font-display text-2xl md:text-3xl font-semibold text-ink">
                      Get in contact with me
                    </h2>
                    <p className="mt-2 text-sm text-muted leading-relaxed">
                      Roles or freelance, same inbox. Send a note and I will get back to you.
                    </p>

                    {submitted ? (
                      <p className="mt-8 text-ink">
                        Message sent. Thanks for reaching out. I will be in touch soon.
                      </p>
                    ) : (
                      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
                        <label className="sr-only" htmlFor="contact-name">Name</label>
                        <input
                          id="contact-name"
                          ref={nameRef}
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder="Name"
                          className="w-full box-dotted bg-raised px-4 py-3 text-sm text-ink placeholder:text-dim"
                        />
                        <label className="sr-only" htmlFor="contact-email">Email</label>
                        <input
                          id="contact-email"
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="Email"
                          className="w-full box-dotted bg-raised px-4 py-3 text-sm text-ink placeholder:text-dim"
                        />
                        <label className="sr-only" htmlFor="contact-message">Message</label>
                        <textarea
                          id="contact-message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          required
                          rows={5}
                          placeholder="Message"
                          className="w-full box-dotted bg-raised px-4 py-3 text-sm text-ink placeholder:text-dim resize-none"
                        />
                        <button
                          type="submit"
                          disabled={sending}
                          className="box-dotted-ink py-3 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                          {sending ? 'Sending...' : 'Send message'}
                        </button>
                        {error && (
                          <p className="text-sm text-accent" role="alert">
                            Something went wrong. Please try again.
                          </p>
                        )}
                      </form>
                    )}
                  </div>

                  <div className="md:pt-12">
                    <ul>
                      {QUICK_LINKS.map((item) => (
                        <li key={item.label} className="border-t border-line first:border-t-0">
                          <a
                            href={item.href}
                            {...(item.download ? { download: true } : { target: '_blank', rel: 'noopener noreferrer' })}
                            className="flex items-center justify-between py-4 text-sm hover:text-ink text-muted transition-colors"
                          >
                            <span>{item.label}</span>
                            <span className="text-ink">{item.value}</span>
                          </a>
                        </li>
                      ))}
                      <li className="border-t border-line">
                        <button
                          type="button"
                          onClick={focusForm}
                          className="w-full flex items-center justify-between py-4 text-sm text-muted hover:text-ink transition-colors"
                        >
                          <span>Email</span>
                          <span className="text-ink">direct</span>
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="button"
            onClick={toggleContact}
            aria-expanded={open}
            aria-controls={panelId}
            className={`contact-bar-toggle pointer-events-auto w-full max-w-xl box-dotted pl-6 pr-2 py-2 flex items-center justify-between gap-4 text-left shadow-bar${contentReady ? '' : ' pointer-events-none'}`}
          >
            <span>
              <span className="block font-display text-[15px] md:text-base font-medium text-ink">
                Get in contact with me<span className="text-accent">!</span>
              </span>
              <span className="block text-xs text-dim mt-0.5">Roles · freelance · say hi</span>
            </span>
            <span className="contact-bar-toggle-icon w-11 h-11 box-dotted text-ink flex items-center justify-center shrink-0">
              {open ? <ArrowDownIcon className="w-4 h-4" /> : <ArrowUpIcon className="w-4 h-4" />}
            </span>
          </motion.button>
        </div>
      </motion.div>
    </>
  )
}
