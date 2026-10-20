import { useState } from 'react'
import { sendLink } from './session'

const LINK_ERRORS = {
  otp_expired: 'That link has expired. Send a new one.',
  access_denied: 'That link did not work. Send a new one.',
}

export default function SignIn({ linkError }) {
  const [email, setEmail] = useState('')
  const [state, setState] = useState(linkError ? 'link_error' : 'idle')
  const [failure, setFailure] = useState(null)

  const submit = async (event) => {
    event.preventDefault()
    setState('sending')
    try {
      await sendLink(email)
      setState('sent')
    } catch (err) {
      setFailure(err)
      setState('failed')
    }
  }

  let message = null
  if (state === 'sent') message = 'If that address is allowed, a link is on its way. Open it on this device.'
  if (state === 'link_error') message = LINK_ERRORS[linkError] ?? LINK_ERRORS.access_denied
  // Say which thing failed, so a setup gap is never mistaken for a typo.
  const FAILURES = {
    not_configured: 'Sign in is not set up on this deployment yet.',
    no_user: 'Supabase has no user for this address yet.',
    email_limit: "Supabase's email limit was reached. Try again later.",
  }
  if (state === 'failed') {
    message =
      FAILURES[failure?.code] ??
      (failure?.status === 429
        ? 'Too many tries. Wait a few minutes.'
        : failure?.status === 404 || failure?.status === 405
          ? 'Sign in runs on Vercel deployments, not the local dev server.'
          : failure?.status === 403
            ? "Open the console from this site's own address."
            : 'The link could not be sent. Try again.')
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-cs-canvas px-4 font-console text-cs-ink">
      <div className="w-full max-w-sm rounded-[10px] border border-cs-line bg-cs-surface p-6">
        <h1 className="text-[20px] font-bold tracking-[-0.02em]">Console</h1>
        <p className="mt-1 text-[13px] text-cs-ink-2">Sign in with a link sent to your email.</p>
        <form onSubmit={submit} className="mt-5 flex flex-col gap-3">
          <label htmlFor="console-email" className="text-[12px] font-medium text-cs-ink-2">
            Email
          </label>
          <input
            id="console-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-[8px] border border-cs-line-strong px-3 py-2 text-[14px] focus:border-cs-link focus:outline-none"
          />
          <button
            type="submit"
            disabled={state === 'sending'}
            className="rounded-[8px] bg-cs-navy px-3 py-2 text-[14px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {state === 'sending' ? 'Sending…' : 'Send sign in link'}
          </button>
        </form>
        {message && (
          <p className={`mt-4 text-[13px] ${state === 'sent' ? 'text-cs-ink' : 'text-cs-bad'}`} role="status">
            {message}
          </p>
        )}
      </div>
    </main>
  )
}
