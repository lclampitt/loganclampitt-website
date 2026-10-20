// The one place api/ talks to Supabase. Server side only: the key comes
// from the Vercel environment and never reaches a browser.
//
//   SUPABASE_URL               https://<ref>.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY  sb_secret_… or the legacy service_role JWT
//                              (SUPABASE_SECRET_KEY is read if that is missing;
//                              the Supabase integration for Vercel may use either)

export function supabaseConfig() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, '')
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY
  return url && key ? { url, key } : null
}

// New secret keys (sb_secret_…) go in the apikey header only; the legacy
// service_role JWT also goes in Authorization.
export function serviceHeaders(key) {
  const headers = { apikey: key, 'content-type': 'application/json' }
  if (key.startsWith('eyJ')) headers.authorization = `Bearer ${key}`
  return headers
}

export const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  })

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
