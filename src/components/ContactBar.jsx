import { useEffect, useId, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { FORMSPREE_ID, LINKS } from '../data/content'
import { useContact } from '../context/useContact'
import { useIntro } from '../context/useIntro'
import { ArrowDownIcon, ArrowUpIcon } from './icons'

const DETAILS = [
  { label: 'Status', value: 'Open to roles / freelance' },
  { label: 'Response', value: 'Usually within a day' },
  { label: 'Time zone', value: 'Pacific (PT)' },
]

const fieldLabel = 'mb-1.5 block font-dot font-black text-[12px] tracking-[0.1em] uppercase text-dim'
const fieldInput =
  'w-full border border-line bg-page px-3 py-2.5 font-mono text-sm text-ink transition-colors focus:border-ink focus:outline-none'

// Whether the "Get in touch" bar belongs on this page: on home only once the hero is scrolled past,
// never on the sim racing page, always elsewhere.
function useBarAllowed() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'
  const isSimRacing = pathname.startsWith('/sim-racing')
  const [pastHero, setPastHero] = useState(false)

  useEffect(() => {
    if (!isHome) return undefined
    let observer
    let frame = 0
    // Page transitions mount the home page after the previous page exits, so wait for the hero to exist
    const attach = () => {
      const hero = document.getElementById('hero')
      if (!hero) {
        frame = requestAnimationFrame(attach)
        return
      }
      observer = new IntersectionObserver(([entry]) => setPastHero(!entry.isIntersecting), {
        rootMargin: '-40% 0px 0px 0px',
      })
      observer.observe(hero)
    }
    attach()
    return () => {
      cancelAnimationFrame(frame)
      observer?.disconnect()
    }
  }, [isHome])

  if (isSimRacing) return false
  return !isHome || pastHero
}

export default function ContactBar() {
  const { open, toggleContact, closeContact } = useContact()
  const { contentReady } = useIntro()
  const barAllowed = useBarAllowed()
  const panelId = useId()
  const nameRef = useRef(null)
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(false)
  const [sending, setSending] = useState(false)

  const barVisible = contentReady && (barAllowed || open)

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
            className="fixed inset-0 z-40 bg-page/80"
          />
        )}
      </AnimatePresence>

      <div className="fixed inset-x-0 bottom-0 z-50 pointer-events-none">
        <div className="ml-auto flex max-w-4xl flex-col items-end px-4 pb-4 md:px-6 md:pb-6">
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
                className="contact-panel pointer-events-auto w-full mb-3 p-5 md:p-8 max-h-[min(80vh,720px)] overflow-y-auto"
                data-lenis-prevent
              >
                <p className="font-dot font-black text-[15px] tracking-[0.14em] uppercase text-muted">Contact</p>
                <div className="mt-4 grid gap-8 md:grid-cols-[1.25fr_0.75fr]">
                  <div>
                    <h2 id="contact-title" className="font-mono text-2xl md:text-[1.75rem] font-semibold text-ink">
                      Get in touch
                    </h2>
                    <p className="mt-2 font-mono text-[13px] leading-relaxed text-muted">
                      Roles or freelance, same inbox. Send a note and I&apos;ll get back to you.
                    </p>

                    {submitted ? (
                      <p className="mt-8 font-mono text-sm text-ink" role="status">
                        Message sent. Thanks for reaching out, I&apos;ll get back to you within a day.
                      </p>
                    ) : (
                      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
                        <div>
                          <label className={fieldLabel} htmlFor="contact-name">Name</label>
                          <input
                            id="contact-name"
                            ref={nameRef}
                            type="text"
                            name="name"
                            autoComplete="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className={fieldInput}
                          />
                        </div>
                        <div>
                          <label className={fieldLabel} htmlFor="contact-email">Email</label>
                          <input
                            id="contact-email"
                            type="email"
                            name="email"
                            autoComplete="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className={fieldInput}
                          />
                        </div>
                        <div>
                          <label className={fieldLabel} htmlFor="contact-message">Message</label>
                          <textarea
                            id="contact-message"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            required
                            rows={5}
                            className={`${fieldInput} resize-none`}
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={sending}
                          className="group flex items-center justify-center gap-2 bg-ink py-3 font-mono text-sm font-semibold text-page transition-colors hover:bg-navy disabled:opacity-50"
                        >
                          {sending ? 'Sending…' : 'Send message'}
                          {!sending && (
                            <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">→</span>
                          )}
                        </button>
                        {error && (
                          <p className="font-mono text-sm text-accent" role="alert">
                            Something went wrong. Try again, or email me directly.
                          </p>
                        )}
                      </form>
                    )}
                  </div>

                  <dl className="contact-details md:pt-11">
                    {DETAILS.map((row) => (
                      <div key={row.label} className="contact-detail">
                        <dt className="spec-label">
                          <span className="spec-tick" aria-hidden="true" />
                          {row.label}
                        </dt>
                        <dd className="spec-value">{row.value}</dd>
                      </div>
                    ))}
                    <div className="contact-detail">
                      <dt className="spec-label">
                        <span className="spec-tick" aria-hidden="true" />
                        Email
                      </dt>
                      <dd className="spec-value">
                        <a
                          href={`mailto:${LINKS.email}`}
                          className="break-all underline decoration-dashed decoration-1 underline-offset-4 hover:text-accent"
                        >
                          {LINKS.email}
                        </a>
                      </dd>
                    </div>
                  </dl>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="button"
            onClick={toggleContact}
            aria-expanded={open}
            aria-controls={panelId}
            tabIndex={barVisible ? 0 : -1}
            initial={false}
            animate={{ opacity: barVisible ? 1 : 0, y: barVisible ? 0 : 16 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className={`contact-bar-toggle border border-line bg-surface py-2 pl-4 pr-2 flex items-center justify-between gap-4 text-left shadow-bar ${barVisible ? 'pointer-events-auto' : 'pointer-events-none'}`}
          >
            <span>
              <span className="block font-mono text-[14px] font-semibold text-ink">Get in touch</span>
              <span className="block font-mono text-[11px] text-dim mt-0.5">Replies within a day</span>
            </span>
            <span className="contact-bar-toggle-icon w-10 h-10 border border-line bg-page text-ink flex items-center justify-center shrink-0">
              {open ? <ArrowDownIcon className="w-4 h-4" /> : <ArrowUpIcon className="w-4 h-4" />}
            </span>
          </motion.button>
        </div>
      </div>
    </>
  )
}
