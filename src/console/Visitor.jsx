import { Link, useParams } from 'react-router-dom'
import {
  cameFrom, channelLabel, envNote, eventLabel, fmtDateTime, fmtNumber, fmtTime, isSerious, machineLabel, pageLabel, placeLabel, plural,
} from './format'
import { Card, Failed, Head, Loading, MessageList } from './ui'
import { useView } from './useView'

// Events arrive oldest first; group them into visits, newest visit first.
function groupSessions(events) {
  const sessions = []
  const byId = new Map()
  for (const e of events) {
    const key = e.session ?? `none-${e.at}`
    let s = byId.get(key)
    if (!s) {
      s = { key, events: [] }
      byId.set(key, s)
      sessions.push(s)
    }
    s.events.push(e)
  }
  return sessions.reverse()
}

function Counter({ label, value }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11.5px] text-cs-ink-2">{label}</dt>
      <dd className="mt-0.5 text-[15px] font-semibold tabular-nums text-cs-ink">{value}</dd>
    </div>
  )
}

// "From Social (linkedin.com), landed on Home", or "Source not measured,
// landed on Home" when the browser could not keep it.
function arrival(first, landing) {
  const page = pageLabel(landing.page)
  if (!first.lt_channel) return `Source not measured, landed on ${page}`
  const source = first.lt_source ? ` (${first.lt_source})` : ''
  return `From ${channelLabel(first.lt_channel)}${source}, landed on ${page}`
}

function Session({ session, open }) {
  const first = session.events[0]
  const landing = session.events.find((e) => e.event_name === 'Page_Viewed') ?? first
  return (
    <details open={open} className="group border-t border-cs-line first:border-t-0">
      <summary className="flex cursor-pointer list-none flex-wrap items-baseline gap-x-3 gap-y-1 py-3 text-[13px]">
        <span className="text-cs-ink-3 transition-transform group-open:rotate-90" aria-hidden="true">›</span>
        <span className="font-medium tabular-nums text-cs-ink">{fmtDateTime(first.at)}</span>
        <span className="text-cs-ink-2">{arrival(first, landing)}</span>
        <span className="ml-auto text-[12px] text-cs-ink-2">{plural(session.events.length, 'event')}</span>
      </summary>
      <ol className="mb-3 ml-5 flex flex-col">
        {session.events.map((e, i) => (
          <li key={i} className="grid grid-cols-[84px_minmax(0,1fr)] gap-3 py-1 text-[13px]">
            <span className="tabular-nums text-cs-ink-2">
              {fmtTime(e.at)}
              {e.server_clock && <span title="Server time, not the browser's">*</span>}
            </span>
            <span className={isSerious(e.event_name) ? 'font-semibold text-cs-ink' : 'text-cs-ink'}>{eventLabel(e)}</span>
          </li>
        ))}
      </ol>
    </details>
  )
}

export default function Visitor() {
  const { n } = useParams()
  const valid = /^\d{1,9}$/.test(n ?? '')
  const view = useView(valid ? { view: 'visitor', n } : null)
  const d = view.data
  const v = d?.visitor

  const back = (
    <Link to="/console/visitors" className="text-[13px] text-cs-link hover:underline">
      All visitors
    </Link>
  )

  if (!valid || (view.status === 'failed' && view.error?.status === 404) || (view.status === 'failed' && view.error?.status === 400)) {
    return (
      <div className="flex flex-col gap-4">
        {back}
        <Head title={`Visitor ${n}`} sub="No visitor with that number." />
      </div>
    )
  }

  const sessions = d ? groupSessions(d.events) : []
  const places = d
    ? [...new Set(d.events.map((e) => placeLabel(e)).filter((p) => p !== 'Not resolved'))]
    : []
  const anyServerClock = d?.events.some((e) => e.server_clock)

  return (
    <div className="flex flex-col gap-6">
      {back}
      <Head
        title={`Visitor ${n}`}
        sub={[
          d?.messages?.[0] ? `Wrote as ${d.messages[0].name}, ${d.messages[0].email}.` : null,
          v?.crawler ? 'Marked as a crawler. Not counted as a person.' : 'Everything this site saw them do.',
          envNote(view.env),
        ]
          .filter(Boolean)
          .join(' ')}
      />
      {view.status === 'loading' && <Loading />}
      {view.status === 'failed' && <Failed error={view.error} onRetry={view.reload} />}
      {view.status === 'ready' && v && (
        <>
          <Card>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4 lg:grid-cols-7">
              <Counter label="Sessions" value={fmtNumber(v.sessions)} />
              <Counter label="Pages" value={fmtNumber(v.pages)} />
              <Counter label="Projects opened" value={fmtNumber(v.projects)} />
              <Counter label="Resume downloads" value={fmtNumber(v.resumes)} />
              <Counter label="Messages sent" value={fmtNumber(v.contacts)} />
              <Counter label="First seen" value={fmtDateTime(v.first_seen)} />
              <Counter label="Last seen" value={fmtDateTime(v.last_seen)} />
            </dl>
          </Card>

          {d.messages?.length > 0 && (
            <Card title={`Messages, ${d.messages.length}`} aside="Newest first, Pacific time">
              <MessageList messages={d.messages} />
            </Card>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card title="Came from">
              <p className="text-[13px]">First visit: {cameFrom(v.ft_channel, v.ft_source)}</p>
              <p className="mt-1 text-[13px]">Latest arrival: {cameFrom(v.lt_channel, v.lt_source)}</p>
            </Card>
            <Card title="Place">
              <p className={`text-[13px] ${places.length ? '' : 'text-cs-ink-2'}`}>
                {places.length ? places.join('; ') : 'Not resolved'}
              </p>
            </Card>
            <Card title="Device">
              <p className={`text-[13px] ${v.machine ? '' : 'text-cs-ink-2'}`}>{machineLabel(v.machine)}</p>
            </Card>
          </div>

          <Card
            title={`Every visit, ${plural(sessions.length, 'session')}`}
            aside="Newest first. Pacific time."
            footnote={
              [
                d.events.length < d.event_count
                  ? `Showing the newest ${fmtNumber(d.events.length)} of ${fmtNumber(d.event_count)} events.`
                  : null,
                anyServerClock ? '* Time from the server, not the browser.' : null,
              ]
                .filter(Boolean)
                .join(' ') || null
            }
          >
            {sessions.map((s, i) => (
              <Session key={s.key} session={s} open={i === 0} />
            ))}
          </Card>
        </>
      )}
    </div>
  )
}
