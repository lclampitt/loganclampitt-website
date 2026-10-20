// The one place api/ talks to Supabase. Server side only: the key comes
// from the Vercel environment and never reaches a browser.
//
//   SUPABASE_URL               https://<ref>.supabase.co
//                              (NEXT_PUBLIC_SUPABASE_URL is read if that is
//                              missing: the URL is not a secret, and the
//                              Supabase integration for Vercel may set either)
//   SUPABASE_SERVICE_ROLE_KEY  sb_secret_… or the legacy service_role JWT
//                              (SUPABASE_SECRET_KEY is read if that is missing)

export function supabaseConfig() {
  const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)?.replace(/\/$/, '')
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY
  return url && key ? { url, key } : null
}

// Which setting is missing, by name only, never a value. Sent with a 503
// so a deployment that is not set up says exactly what it lacks.
export function missingConfig({ console: forConsole = false } = {}) {
  const missing = []
  if (!process.env.SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL) missing.push('SUPABASE_URL')
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_SECRET_KEY) missing.push('SUPABASE_SERVICE_ROLE_KEY')
  if (forConsole && !process.env.CONSOLE_EMAIL?.trim()) missing.push('CONSOLE_EMAIL')
  return missing
}

export const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  })

export const notConfigured = (opts) => json(503, { error: 'not_configured', missing: missingConfig(opts) })

// New secret keys (sb_secret_…) go in the apikey header only; the legacy
// service_role JWT also goes in Authorization.
export function serviceHeaders(key) {
  const headers = { apikey: key, 'content-type': 'application/json' }
  if (key.startsWith('eyJ')) headers.authorization = `Bearer ${key}`
  return headers
}

// Call a SQL function (supabase/migrations/0002_console.sql). Throws on
// failure with the status only: PostgREST's error text can quote data.
export async function rpc(config, fn, args) {
  const res = await fetch(`${config.url}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: serviceHeaders(config.key),
    body: JSON.stringify(args),
  })
  if (!res.ok) throw new Error(`${fn} failed with ${res.status}`)
  return res.json()
}

// Which deployment's data a request may see. Production reads production;
// a preview reads its own preview data, so testing never mixes in.
export function siteEnv() {
  const env = process.env.VERCEL_ENV
  return env === 'production' || env === 'preview' ? env : 'development'
}
