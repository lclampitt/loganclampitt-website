import { useState } from 'react'
import { signIn } from './session'

// Say which thing failed, so a setup gap is never mistaken for a typo.
function failureMessage(err) {
  if (err?.code === 'wrong_credentials') return 'That email and password do not match.'
  if (err?.code === 'not_configured') return 'Sign in is not set up on this deployment yet.'
  if (err?.status === 429) return 'Too many tries. Wait a few minutes.'
  if (err?.code === 'network') return 'Could not reach the server. Check your connection.'
  if (err?.status === 404 || err?.status === 405) return 'Sign in could not be reached on this server.'
  if (err?.status === 403) return "Open the console from this site's own address."
  return 'Sign in failed on the server. Try again.'
}

const field = 'rounded-[8px] border border-cs-line-strong px-3 py-2 text-[14px] focus:border-cs-link focus:outline-none'
const label = 'text-[12px] font-medium text-cs-ink-2'

export default function SignIn({ onSignedIn }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [failure, setFailure] = useState(null)

  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setFailure(null)
    try {
      await signIn(email, password)
      setPassword('')
      onSignedIn()
    } catch (err) {
      setFailure(err)
      setBusy(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-cs-canvas px-4 font-console text-cs-ink">
      <div className="w-full max-w-sm rounded-[10px] border border-cs-line bg-cs-surface p-6">
        <h1 className="text-[20px] font-bold tracking-[-0.02em]">Console</h1>
        <p className="mt-1 text-[13px] text-cs-ink-2">Sign in to see who visits the site.</p>
        <form onSubmit={submit} className="mt-5 flex flex-col gap-3">
          <label htmlFor="console-email" className={label}>
            Email
          </label>
          <input
            id="console-email"
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={field}
          />
          <label htmlFor="console-password" className={`${label} mt-1`}>
            Password
          </label>
          <input
            id="console-password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={field}
          />
          <button
            type="submit"
            disabled={busy}
            className="mt-2 rounded-[8px] bg-cs-navy px-3 py-2 text-[14px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        {failure && (
          <p className="mt-4 text-[13px] text-cs-bad" role="alert">
            {failureMessage(failure)}
          </p>
        )}
      </div>
    </main>
  )
}
