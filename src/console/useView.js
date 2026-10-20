import { useCallback, useEffect, useState } from 'react'
import { readView } from './session'

// Loads one console view. `status` is loading, ready or failed; a failed
// read keeps its error so the page can say what went wrong, never blank.
// Pass null to load nothing (the page already knows the answer).
export function useView(params) {
  const key = params ? JSON.stringify(params) : null
  const [state, setState] = useState({ status: 'loading', key })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!key) return undefined
    let live = true
    readView(JSON.parse(key)).then(
      (body) => live && setState({ status: 'ready', key, data: body.data, env: body.env, at: body.generated_at }),
      (error) => live && setState({ status: 'failed', key, error }),
    )
    return () => {
      live = false
    }
  }, [key, attempt])

  // Try again shows loading at once, so a second failure is visibly new.
  const reload = useCallback(() => {
    setState((s) => ({ ...s, status: 'loading' }))
    setAttempt((n) => n + 1)
  }, [])
  if (!key) return { status: 'idle', reload }
  // A new set of params shows loading, not the previous view's numbers.
  return state.key === key ? { ...state, reload } : { status: 'loading', reload }
}
