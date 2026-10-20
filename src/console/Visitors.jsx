import { useState } from 'react'
import { Link } from 'react-router-dom'
import { cameFrom, channelLabel, envNote, fmtDateTime, fmtNumber, machineLabel, placeLabel, plural } from './format'
import { readView } from './session'
import { Card, Empty, Failed, Head, Loading } from './ui'
import { useView } from './useView'

// What a visitor did that counts as looking seriously, in plain words.
function seriousWords(row) {
  return [row.resumes > 0 && 'Resume', row.contacts > 0 && 'Message', row.projects > 0 && 'Project']
    .filter(Boolean)
    .join(', ')
}

const th = 'px-3 py-2 text-left text-[10.5px] font-semibold uppercase tracking-[0.06em] text-cs-ink-2 whitespace-nowrap'
const td = 'px-3 py-2.5 align-top text-[13px] text-cs-ink'

function Row({ row }) {
  const returned = row.lt_channel && (row.lt_channel !== row.ft_channel || row.lt_source !== row.ft_source)
  return (
    <tr className="border-t border-cs-line hover:bg-cs-canvas">
      <td className={`${td} whitespace-nowrap`}>
        <Link to={`/console/visitors/${row.n}`} className="font-medium text-cs-link hover:underline">
          Visitor {row.n}
        </Link>
      </td>
      <td className={`${td} whitespace-nowrap tabular-nums`}>{fmtDateTime(row.last_seen)}</td>
      <td className={`${td} whitespace-nowrap tabular-nums text-cs-ink-2`}>{fmtDateTime(row.first_seen)}</td>
      <td className={`${td} text-right tabular-nums`}>{fmtNumber(row.sessions)}</td>
      <td className={`${td} text-right tabular-nums`}>{fmtNumber(row.pages)}</td>
      <td className={td}>{seriousWords(row)}</td>
      <td className={td}>
        {cameFrom(row.ft_channel, row.ft_source)}
        {returned && <span className="block text-[12px] text-cs-ink-2">Returned via {channelLabel(row.lt_channel)}</span>}
      </td>
      <td className={`${td} ${row.place ? '' : 'text-cs-ink-2'}`}>{placeLabel(row.place)}</td>
      <td className={`${td} ${row.machine ? '' : 'text-cs-ink-2'}`}>{machineLabel(row.machine)}</td>
    </tr>
  )
}

export default function Visitors() {
  const first = useView({ view: 'visitors', offset: 0 })
  // Later pages belong to the first page they were loaded after; a fresh
  // first page (a retry) starts the list again.
  const [more, setMore] = useState({ after: null, rows: [] })
  const [loadingMore, setLoadingMore] = useState(false)
  const [moreFailed, setMoreFailed] = useState(false)

  const extra = more.after === first.at ? more.rows : []
  const rows = first.data ? [...first.data.rows, ...extra] : []
  const total = first.data?.total ?? 0

  const loadMore = async () => {
    setLoadingMore(true)
    setMoreFailed(false)
    try {
      const body = await readView({ view: 'visitors', offset: rows.length })
      // Someone visiting between pages moves rows up the list, so the next
      // page can repeat one; each person is shown once.
      const seen = new Set(rows.map((r) => r.n))
      setMore({ after: first.at, rows: [...extra, ...body.data.rows.filter((r) => !seen.has(r.n))] })
    } catch {
      setMoreFailed(true)
    } finally {
      setLoadingMore(false)
    }
  }

  const sub = first.data
    ? [
        `${plural(total, 'person', 'people')}, most recent first.`,
        first.data.excluded_crawlers ? `Leaves out ${plural(first.data.excluded_crawlers, 'crawler')}.` : null,
        envNote(first.env),
      ]
        .filter(Boolean)
        .join(' ')
    : 'Most recent first.'

  return (
    <div className="flex flex-col gap-6">
      <Head title="Visitors" sub={sub} />
      {first.status === 'loading' && <Loading />}
      {first.status === 'failed' && <Failed error={first.error} onRetry={first.reload} />}
      {first.status === 'ready' && rows.length === 0 && (
        <Card>
          <Empty hint="People show up here after their first visit.">Nobody yet.</Empty>
        </Card>
      )}
      {first.status === 'ready' && rows.length > 0 && (
        <Card className="!px-0 !pb-0">
          <div className="relative overflow-x-auto">
            <table className="w-full min-w-[960px] border-collapse">
              <thead>
                <tr>
                  <th className={th}>Visitor</th>
                  <th className={th}>Last seen</th>
                  <th className={th}>First seen</th>
                  <th className={`${th} text-right`}>Sessions</th>
                  <th className={`${th} text-right`}>Pages</th>
                  <th className={th}>Looked seriously</th>
                  <th className={th}>Came from</th>
                  <th className={th}>Place</th>
                  <th className={th}>Device</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <Row key={row.n} row={row} />
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center gap-3 border-t border-cs-line px-4 py-3 text-[12px] text-cs-ink-2">
            <span>
              Showing {fmtNumber(rows.length)} of {fmtNumber(total)}.
            </span>
            {rows.length < total && (
              <button
                type="button"
                onClick={loadMore}
                disabled={loadingMore}
                className="font-medium text-cs-link hover:underline disabled:opacity-50"
              >
                {loadingMore ? 'Loading…' : 'Show 50 more'}
              </button>
            )}
            {moreFailed && <span className="text-cs-bad">Could not load more.</span>}
          </div>
        </Card>
      )}
      <p className="text-[12px] text-cs-ink-2">
        Numbers are given in order of first visit. Gaps are crawlers, left out on purpose.
      </p>
    </div>
  )
}
