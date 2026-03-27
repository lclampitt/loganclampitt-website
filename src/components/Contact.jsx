import { useState } from 'react'
import { motion } from 'framer-motion'

const FORMSPREE_ID = 'mdapkror'

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(false)
  const [sending, setSending] = useState(false)

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
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
    <section id="contact" className="py-28 bg-[#080808]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-[#4F46E5] text-xs font-semibold tracking-widest uppercase mb-3"
        >
          Get In Touch
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.05 }}
          className="text-3xl md:text-4xl font-black text-white mb-4"
        >
          Contact
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
          className="text-white/40 text-base mb-16 max-w-md"
        >
          Have a project in mind or just want to say hi? Send a message and I'll get back to you.
        </motion.p>

        <div className="grid md:grid-cols-2 gap-16 items-start">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
          >
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="bg-[#4F46E5]/10 border border-[#4F46E5]/30 rounded-2xl p-8 text-center"
              >
                <div className="w-12 h-12 rounded-full bg-[#4F46E5]/20 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-[#4F46E5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-white font-semibold text-lg">Message Sent!</p>
                <p className="text-white/50 text-sm mt-2">Thanks for reaching out. I'll be in touch soon.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {/* Name */}
                <div>
                  <label className="block text-white/50 text-xs font-semibold uppercase tracking-widest mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Your name"
                    className="w-full bg-[#0e0e0e] border border-white/8 rounded-xl px-4 py-3
                               text-white text-sm placeholder-white/20
                               focus:outline-none focus:border-[#4F46E5]/60 focus:bg-[#0e0e0e]
                               transition-colors duration-200"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-white/50 text-xs font-semibold uppercase tracking-widest mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="your@email.com"
                    className="w-full bg-[#0e0e0e] border border-white/8 rounded-xl px-4 py-3
                               text-white text-sm placeholder-white/20
                               focus:outline-none focus:border-[#4F46E5]/60
                               transition-colors duration-200"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-white/50 text-xs font-semibold uppercase tracking-widest mb-2">
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    placeholder="Tell me about your project..."
                    className="w-full bg-[#0e0e0e] border border-white/8 rounded-xl px-4 py-3
                               text-white text-sm placeholder-white/20 resize-none
                               focus:outline-none focus:border-[#4F46E5]/60
                               transition-colors duration-200"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full py-3.5 bg-[#4F46E5] text-white text-sm font-semibold rounded-xl
                             border border-[#4F46E5] transition-all duration-200
                             hover:bg-transparent hover:text-[#4F46E5]
                             disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? 'Sending…' : 'Send Message'}
                </button>
                {error && (
                  <p className="text-red-400 text-xs text-center mt-1">
                    Something went wrong. Please try again.
                  </p>
                )}
              </form>
            )}
          </motion.div>

          {/* Right side info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.15 }}
            className="flex flex-col gap-8"
          >
            <div>
              <p className="text-white/30 text-xs font-semibold tracking-widest uppercase mb-4">
                Connect
              </p>
              <div className="flex flex-col gap-4">
                {/* GitHub */}
                <a
                  href="https://github.com/lclampitt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 p-4 bg-[#0e0e0e] border border-white/5
                             rounded-xl transition-all duration-200 hover:border-[#4F46E5]/30
                             hover:bg-[#4F46E5]/5"
                >
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center
                                  group-hover:bg-[#4F46E5]/15 transition-colors duration-200">
                    <svg className="w-5 h-5 text-white/60 group-hover:text-[#4F46E5]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">GitHub</p>
                    <p className="text-white/40 text-xs">View my repositories</p>
                  </div>
                  <span className="ml-auto text-white/20 group-hover:text-[#4F46E5] transition-colors">→</span>
                </a>

                {/* LinkedIn */}
                <a
                  href="https://www.linkedin.com/in/loganclampitt/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 p-4 bg-[#0e0e0e] border border-white/5
                             rounded-xl transition-all duration-200 hover:border-[#4F46E5]/30
                             hover:bg-[#4F46E5]/5"
                >
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center
                                  group-hover:bg-[#4F46E5]/15 transition-colors duration-200">
                    <svg className="w-5 h-5 text-white/60 group-hover:text-[#4F46E5]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">LinkedIn</p>
                    <p className="text-white/40 text-xs">Connect professionally</p>
                  </div>
                  <span className="ml-auto text-white/20 group-hover:text-[#4F46E5] transition-colors">→</span>
                </a>
              </div>
            </div>

            {/* Resume */}
            <div>
              <p className="text-white/30 text-xs font-semibold tracking-widest uppercase mb-4">
                My Resume
              </p>
              <a
                href="/Resume - Logan Clampitt March 2026 (1).pdf"
                download
                className="group flex items-center gap-4 p-4 bg-[#0e0e0e] border border-white/5
                           rounded-xl transition-all duration-200 hover:border-[#4F46E5]/30
                           hover:bg-[#4F46E5]/5"
              >
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center
                                group-hover:bg-[#4F46E5]/15 transition-colors duration-200">
                  <svg className="w-5 h-5 text-white/60 group-hover:text-[#4F46E5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h4a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Download Resume</p>
                  <p className="text-white/40 text-xs">PDF</p>
                </div>
                <span className="ml-auto text-white/20 group-hover:text-[#4F46E5] transition-colors">↓</span>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
