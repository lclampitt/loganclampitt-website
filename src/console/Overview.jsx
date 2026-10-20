import { useState } from 'react'
import { envNote, fmtDateTime, fmtDay, fmtNumber, plural } from './format'
import { Card, Choice, Empty, Failed, Figure, Head, Loading } from './ui'
import { useView } from './useView'

const PERIODS = [
  { value: 7, label: '7 days' },
  { value: 30, label: '30 days' },
]

// "Up from 8 the week before". Counts, not percentages: on a small site a
// percentage turns one visitor into "+100%". Without a comparable earlier
// period it says so instead of comparing against nothing measured.
function trend(now, before, days, comparable) {
  if (!comparable) return 'Not enough history to compare yet.'
  const span = days === 7 ? 'the week before' : 'the 30 days before'
  if (now === before) return `Same as ${span}.`
  return `${now > before ? 'Up' : 'Down'} from ${fmtNumber(before)} ${span}.`
}

function DailyBars({ daily }) {
  const most = Math.max(1, ...daily.map((d) => d.visitors))
  const label = daily.length > 10 ? (i) => i % 5 === 0 || i === daily.length - 1 : () => true
  return (
    <div>
      <div className="flex h-[120px] items-end gap-[3px] border-b border-cs-line-strong">
        {daily.map((d, i) => (
          <div key={d.day} className="flex h-full flex-1 items-end" title={`${fmtDay(d.day)}: ${plural(d.visitors, 'visitor')}`}>
            <div
              className="cs-rise w-full rounded-t-[2px] bg-cs-chart"
              style={{ height: d.visitors ? `${(d.visitors / most) * 100}%` : '0%', animationDelay: `${i * 35}ms` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex gap-[3px]">
        {daily.map((d, i) => (
          <span key={d.day} className="flex-1 truncate text-center text-[10.5px] text-cs-ink-2">
            {label(i) ? fmtDay(d.day) : ''}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function Overview() {
  const [days, setDays] = useState(7)
  const view = useView({ view: 'overview', days })
  const o = view.data

  const exclusions = []
  if (o?.excluded_crawlers) exclusions.push(`Leaves out ${plural(o.excluded_crawlers, 'crawler')}.`)
  if (o?.ephemeral_events) exclusions.push(`${plural(o.ephemeral_events, 'event')} without a stored id not counted.`)

  return (
    <div className="flex flex-col gap-6">
      <Head title="Overview" sub={['Pacific time. Crawlers left out.', envNote(view.env)].filter(Boolean).join(' ')}>
        <Choice label="Period" options={PERIODS} value={days} onChange={setDays} />
      </Head>

      {view.status === 'loading' && <Loading />}
      {view.status === 'failed' && <Failed error={view.error} onRetry={view.reload} />}
      {view.status === 'ready' && !o.first_seen && (
        <Card>
          <Empty hint="Visits show up here within a minute of happening.">Nothing recorded yet.</Empty>
        </Card>
      )}
      {view.status === 'ready' && o.first_seen && (
        <>
          <Card title="Today" aside="Since midnight">
            <div className="grid grid-cols-2 gap-6 sm:max-w-md">
              <Figure label="Visitors" value={o.today_visitors} />
              <Figure label="Sessions" value={o.today_sessions} />
            </div>
          </Card>

          <Card title={`Last ${days} days`} footnote={exclusions.length ? exclusions.join(' ') : null}>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <Figure label="Visitors" value={o.visitors} note={trend(o.visitors, o.visitors_before, days, o.comparable)} />
              <Figure label="Sessions" value={o.sessions} note={trend(o.sessions, o.sessions_before, days, o.comparable)} />
              <Figure
                label="Looking seriously"
                value={o.serious_visitors}
                note={trend(o.serious_visitors, o.serious_visitors_before, days, o.comparable)}
              />
            </div>
            <p className="mt-3 text-[12px] text-cs-ink-2">Looking seriously: downloaded the resume, sent a message or opened a project.</p>
            {o.daily.length > 0 && (
              <div className="mt-6">
                <p className="mb-2 text-[12px] font-medium text-cs-ink-2">Visitors per Pacific day, today so far</p>
                <DailyBars daily={o.daily} />
              </div>
            )}
          </Card>

          <p className="text-[12px] text-cs-ink-2">
            Collecting since {fmtDateTime(o.first_seen)}. Newest event {fmtDateTime(o.newest_event)}.
          </p>
        </>
      )}
    </div>
  )
}
