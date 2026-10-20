import { useState } from 'react'
import BusiestTimes from './BusiestTimes'
import { SERIOUS_LABELS, channelLabel, envNote, fmtNumber, pageLabel, plural, projectTitle } from './format'
import { Bars, Card, Choice, Empty, Failed, Head, Loading } from './ui'
import { useView } from './useView'

const RANGES = [
  { value: 'all', label: 'All time' },
  { value: 30, label: '30 days' },
  { value: 7, label: '7 days' },
]
const RANGE_LABELS = { all: 'all time', 30: 'last 30 days', 7: 'last 7 days' }

const maxOf = (rows, key) => Math.max(0, ...rows.map((r) => r[key] ?? 0))

function Serious({ serious, visitors }) {
  const counts = Object.fromEntries(serious.by_event.map((e) => [e.event_name, e]))
  return (
    <Card
      title="Looking seriously"
      footnote={`${fmtNumber(serious.any_visitors)} of ${plural(visitors, 'person', 'people')} did at least one.`}
    >
      <ul className="flex flex-col divide-y divide-cs-line">
        {Object.entries(SERIOUS_LABELS).map(([name, label]) => {
          const row = counts[name]
          return (
            <li key={name} className="flex items-baseline justify-between gap-4 py-2 text-[13px]">
              <span>{label}</span>
              <span className="tabular-nums">
                {fmtNumber(row?.count ?? 0)}
                <span className="ml-2 text-[12px] text-cs-ink-2">{plural(row?.visitors ?? 0, 'person', 'people')}</span>
              </span>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}

function ListCard({ title, rows, empty, valueKey, render, footnote }) {
  return (
    <Card title={title} footnote={rows.length ? footnote : null}>
      {rows.length ? <Bars rows={rows} max={maxOf(rows, valueKey)} render={render} /> : <Empty>{empty}</Empty>}
    </Card>
  )
}

export default function Behaviour() {
  const [range, setRange] = useState('all')
  const [timesMode, setTimesMode] = useState('hour')
  const view = useView({ view: 'behaviour', days: range })
  const b = view.data

  const sub = ['Pacific time. Crawlers left out.', envNote(view.env)].filter(Boolean).join(' ')

  return (
    <div className="flex flex-col gap-6">
      <Head title="Behaviour" sub={sub}>
        <Choice label="Range" options={RANGES} value={range} onChange={setRange} />
      </Head>
      {view.status === 'loading' && <Loading />}
      {view.status === 'failed' && <Failed error={view.error} onRetry={view.reload} />}
      {view.status === 'ready' && b.events === 0 && (
        <Card>
          <Empty hint={range === 'all' ? 'Visits show up here within a minute.' : 'Try a longer range.'}>
            Nobody has been on the site {range === 'all' ? 'yet' : `in the ${RANGE_LABELS[range]}`}.
          </Empty>
        </Card>
      )}
      {view.status === 'ready' && b.events > 0 && (
        <>
          <p className="text-[13px] text-cs-ink">
            {plural(b.visitors, 'person', 'people')}, {plural(b.sessions, 'session')}, {RANGE_LABELS[range]}.
            {b.excluded_crawlers > 0 && (
              <span className="text-cs-ink-2"> Leaves out {plural(b.excluded_crawlers, 'crawler')}.</span>
            )}
          </p>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Serious serious={b.serious} visitors={b.visitors} />
            <ListCard
              title="Projects opened"
              rows={b.projects}
              empty="No project opened yet."
              valueKey="opens"
              render={(r) => ({ label: projectTitle(r.slug), value: r.opens, note: plural(r.visitors, 'person', 'people') })}
            />
            <ListCard
              title="Top pages"
              rows={b.pages}
              empty="No pages viewed yet."
              valueKey="views"
              render={(r) => ({ label: pageLabel(r.page), value: r.views, note: plural(r.visitors, 'person', 'people') })}
              footnote="Views. People below each."
            />
            <ListCard
              title="Where they leave"
              rows={b.exits}
              empty="No visits to read yet."
              valueKey="sessions"
              render={(r) => ({
                label: pageLabel(r.page),
                value: r.sessions,
                note: `${fmtNumber(r.one_page)} saw only this page`,
              })}
              footnote="Visits that ended on each page."
            />
            <ListCard
              title="Where they came from"
              rows={b.channels}
              empty="No first visits yet."
              valueKey="visitors"
              render={(r) => ({ label: channelLabel(r.channel), value: r.visitors })}
              footnote="People, by how they first arrived."
            />
            <ListCard
              title="Referrers"
              rows={b.referrers}
              empty="No referring sites yet."
              valueKey="visitors"
              render={(r) => ({ label: r.source, value: r.visitors, note: channelLabel(r.channel) })}
              footnote="People, by the site or tag that first sent them."
            />
            <ListCard
              title="Links out"
              rows={b.outbound}
              empty="No links out clicked yet."
              valueKey="clicks"
              render={(r) => ({
                label: r.target === 'email' ? 'Email address' : (r.host ?? r.target),
                value: r.clicks,
                note: plural(r.visitors, 'person', 'people'),
              })}
            />
          </div>

          <BusiestTimes
            hours={b.hours}
            weekdays={b.weekdays}
            rangeLabel={RANGE_LABELS[range]}
            mode={timesMode}
            onMode={setTimesMode}
          />
        </>
      )}
    </div>
  )
}
