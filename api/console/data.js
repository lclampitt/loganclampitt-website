// GET /api/console/data?view=…: every number the console shows, read
// through the SQL functions in supabase/migrations/0002_console.sql.
// Nothing is read until requireConsole has checked the session.
//
//   view=overview   &days=7|30
//   view=visitors   &offset=N
//   view=visitor    &n=N
//   view=behaviour  &days=7|30|all

import { requireConsole } from '../_lib/console-auth.js'
import { json, rpc, siteEnv, supabaseConfig } from '../_lib/supabase.js'

const PAGE = 50

function intParam(params, name, { min, max }) {
  const raw = params.get(name)
  if (raw == null || !/^\d{1,9}$/.test(raw)) return null
  const n = Number(raw)
  return n >= min && n <= max ? n : null
}

export async function GET(request) {
  const refused = await requireConsole(request)
  if (refused) return refused

  const params = new URL(request.url).searchParams
  const view = params.get('view')
  const env = siteEnv()
  const config = supabaseConfig()

  let fn
  let args
  if (view === 'overview') {
    const days = intParam(params, 'days', { min: 7, max: 30 })
    if (days !== 7 && days !== 30) return json(400, { error: 'bad_days' })
    ;[fn, args] = ['console_overview', { p_env: env, p_days: days }]
  } else if (view === 'visitors') {
    const offset = params.has('offset') ? intParam(params, 'offset', { min: 0, max: 1_000_000 }) : 0
    if (offset == null) return json(400, { error: 'bad_offset' })
    ;[fn, args] = ['console_visitors', { p_env: env, p_limit: PAGE, p_offset: offset }]
  } else if (view === 'visitor') {
    const n = intParam(params, 'n', { min: 1, max: 1_000_000_000 })
    if (n == null) return json(400, { error: 'bad_visitor' })
    ;[fn, args] = ['console_visitor', { p_env: env, p_n: n }]
  } else if (view === 'behaviour') {
    const raw = params.get('days')
    const days = raw === 'all' ? null : intParam(params, 'days', { min: 7, max: 30 })
    if (raw !== 'all' && days !== 7 && days !== 30) return json(400, { error: 'bad_days' })
    ;[fn, args] = ['console_behaviour', { p_env: env, p_days: days }]
  } else {
    return json(400, { error: 'bad_view' })
  }

  let data
  try {
    data = await rpc(config, fn, args)
  } catch (err) {
    console.error(`console data: ${err.message}`)
    return json(502, { error: 'read_failed' })
  }
  if (data == null) return json(404, { error: 'not_found' })
  return json(200, { env, generated_at: new Date().toISOString(), data })
}
