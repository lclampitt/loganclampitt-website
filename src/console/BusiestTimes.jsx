import { fmtNumber, plural } from './format'
import { Card, Choice } from './ui'

// Busiest times, after pixel-lord's card: By hour counts every event in
// the range by its Pacific hour; By day averages each weekday over whole
// days only (today is still happening), quiet days included, so a weekday
// that came round more often is not favoured.
//
// A pattern needs enough behind it. Below about 120 events across 7 days
// the card says how far off it is rather than drawing noise.
const ENOUGH_EVENTS = 120
const ENOUGH_DAYS = 7

const HOUR_LABELS = ['12a', '3a', '6a', '9a', '12p', '3p', '6p', '9p']
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const WEEKDAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const hourName = (h) => `${h % 12 === 0 ? 12 : h % 12} ${h < 12 ? 'am' : 'pm'}`
const perDay = (n) => (n < 10 ? Math.round(n * 10) / 10 : Math.round(n))

// Parts of the day under the hour axis: night 12a to 6a, morning to 12p,
// afternoon to 5p, evening to midnight.
const PARTS = [
  { label: 'Night', hours: 6 },
  { label: 'Morning', hours: 6 },
  { label: 'Afternoon', hours: 5 },
  { label: 'Evening', hours: 7 },
]

function columnsFor(mode, hours, weekdays) {
  if (mode === 'hour') {
    return hours.by_hour.map((h) => ({
      key: h.hour,
      all: h.events,
      serious: h.serious,
      label: h.hour % 3 === 0 ? HOUR_LABELS[h.hour / 3] : '',
      name: hourName(h.hour),
      title: `${hourName(h.hour)}: ${plural(h.events, 'event')}`,
    }))
  }
  return weekdays.by_weekday.map((w) => {
    const all = w.days ? w.events / w.days : null
    const serious = w.days ? w.serious / w.days : null
    return {
      key: w.weekday,
      all,
      serious,
      label: WEEKDAYS[w.weekday - 1],
      name: WEEKDAY_NAMES[w.weekday - 1],
      title: all == null ? `${WEEKDAY_NAMES[w.weekday - 1]}: no whole day yet` : `${WEEKDAY_NAMES[w.weekday - 1]}: ${perDay(all)} a day`,
    }
  })
}

function NotEnough({ events, days, whole }) {
  const unit = whole ? 'whole day' : 'day'
  return (
    <div className="py-4">
      <p className="text-[13px] text-cs-ink">Not enough yet.</p>
      <p className="mt-1 text-[12px] text-cs-ink-2">
        {plural(events, 'event')} over {plural(days, unit)}. A pattern needs about {ENOUGH_EVENTS} across {ENOUGH_DAYS}.
      </p>
    </div>
  )
}

// `mode` lives in the page, so switching the range keeps By hour or By day.
export default function BusiestTimes({ hours, weekdays, rangeLabel, mode, onMode }) {
  const events = mode === 'hour' ? hours.events : weekdays.events
  const days = mode === 'hour' ? hours.days : weekdays.whole_days
  const enough = events >= ENOUGH_EVENTS && days >= ENOUGH_DAYS

  const cols = columnsFor(mode, hours, weekdays)
  const most = Math.max(0, ...cols.map((c) => c.all ?? 0))
  const peak = most > 0 ? cols.find((c) => c.all === most) : null

  return (
    <Card
      title="Busiest times"
      controls={
        <>
          <Choice
            label="Busiest times view"
            options={[
              { value: 'hour', label: 'By hour' },
              { value: 'day', label: 'By day' },
            ]}
            value={mode}
            onChange={onMode}
          />
          <span className="text-[12px] text-cs-ink-2">{rangeLabel}</span>
        </>
      }
      aside={
        enough && peak ? (
          <span>
            Peak <b className="font-semibold text-cs-ink">{peak.name}</b>. Pacific time.
          </span>
        ) : (
          'Pacific time.'
        )
      }
    >
      {!enough ? (
        <NotEnough events={events} days={days} whole={mode === 'day'} />
      ) : (
        <div>
          <div
            key={mode}
            className={`grid h-[190px] items-end border-b border-cs-line-strong ${mode === 'hour' ? 'gap-[5px]' : 'gap-[14px]'}`}
            style={{ gridTemplateColumns: `repeat(${cols.length}, minmax(0, 1fr))` }}
          >
            {cols.map((c, i) => (
              <div key={c.key} className="relative flex h-full items-end" title={c.title}>
                {c === peak && (
                  <span className="absolute left-1/2 -translate-x-1/2 text-[10.5px] font-semibold text-cs-chart-deep tabular-nums" style={{ bottom: `calc(${(c.all / most) * 100}% + 4px)` }}>
                    {mode === 'hour' ? fmtNumber(c.all) : perDay(c.all)}
                  </span>
                )}
                <div
                  className="cs-rise relative w-full rounded-t-[3px] bg-cs-chart/20"
                  style={{ height: c.all ? `${(c.all / most) * 100}%` : '0%', animationDelay: `${i * 35}ms` }}
                >
                  {c.serious > 0 && (
                    <div
                      className={`absolute bottom-0 rounded-t-[2px] bg-cs-chart ${mode === 'hour' ? 'inset-x-[22%]' : 'inset-x-[30%]'}`}
                      style={{ height: `${(c.serious / c.all) * 100}%` }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
          <div
            className={`mt-1.5 grid ${mode === 'hour' ? 'gap-[5px]' : 'gap-[14px]'}`}
            style={{ gridTemplateColumns: `repeat(${cols.length}, minmax(0, 1fr))` }}
          >
            {cols.map((c) => (
              <span key={c.key} className="text-center text-[10.5px] text-cs-ink-2">
                {c.label}
              </span>
            ))}
          </div>
          {mode === 'hour' ? (
            <div className="mt-2 grid gap-[5px]" style={{ gridTemplateColumns: 'repeat(24, minmax(0, 1fr))' }}>
              {PARTS.map((p) => (
                <span
                  key={p.label}
                  className="border-t-2 border-cs-line-strong pt-1 text-[10px] font-semibold uppercase tracking-[0.06em] text-cs-ink-2"
                  style={{ gridColumn: `span ${p.hours}` }}
                >
                  {p.label}
                </span>
              ))}
            </div>
          ) : (
            <div className="mt-2 grid gap-[14px]" style={{ gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' }}>
              <span className="border-t-2 border-cs-line-strong pt-1 text-[10px] font-semibold uppercase tracking-[0.06em] text-cs-ink-2" style={{ gridColumn: 'span 5' }}>
                Weekdays
              </span>
              <span className="border-t-2 border-cs-line-strong pt-1 text-[10px] font-semibold uppercase tracking-[0.06em] text-cs-ink-2" style={{ gridColumn: 'span 2' }}>
                Weekend
              </span>
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-[12px] text-cs-ink-2">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-[2px] bg-cs-chart/20" aria-hidden="true" />
              All activity{mode === 'day' ? ', average per day' : ''}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-[2px] bg-cs-chart" aria-hidden="true" />
              Looking seriously: resume, message or project
            </span>
          </div>
          {mode === 'day' && (
            <p className="mt-2 text-[12px] text-cs-ink-2">Over {plural(days, 'whole day')}. Today is left out until it ends.</p>
          )}
        </div>
      )}
    </Card>
  )
}
