// The console's few building blocks. Flat white cards with a full
// hairline border; never a coloured side border, never a status pill.
// Status is a plain word. Numbers are tabular.

import { fmtNumber } from './format'

export function Head({ title, sub, children }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-cs-line pb-4">
      <div>
        <h1 className="text-[22px] font-bold tracking-[-0.03em] text-cs-ink">{title}</h1>
        {sub && <p className="mt-1 text-[13px] text-cs-ink-2">{sub}</p>}
      </div>
      {children}
    </header>
  )
}

// `controls` sit beside the heading, outside it, so the heading's name
// stays just its title.
export function Card({ title, controls, aside, footnote, children, className = '' }) {
  return (
    <section className={`rounded-[10px] border border-cs-line bg-cs-surface px-4 pt-3.5 pb-4 ${className}`}>
      {(title || aside) && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <div className="flex flex-wrap items-center gap-3">
            {title && <h2 className="text-[13.5px] font-semibold text-cs-ink">{title}</h2>}
            {controls}
          </div>
          {aside && <div className="text-[12px] text-cs-ink-2">{aside}</div>}
        </div>
      )}
      {children}
      {footnote && <p className="mt-3 border-t border-cs-line pt-2.5 text-[12px] text-cs-ink-2">{footnote}</p>}
    </section>
  )
}

// A big figure: the number, what it is, and one short clarifier.
export function Figure({ label, value, note }) {
  return (
    <div className="min-w-0">
      <p className="text-[12px] font-medium text-cs-ink-2">{label}</p>
      <p className={`mt-1 text-[30px] font-semibold leading-none tabular-nums ${value ? 'text-cs-ink' : 'text-cs-ink-2'}`}>
        {fmtNumber(value)}
      </p>
      {note && <p className="mt-1.5 text-[12px] text-cs-ink-2">{note}</p>}
    </div>
  )
}

// Segmented choice: 7 days / 30 days, By hour / By day.
export function Choice({ options, value, onChange, label }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-[7px] border border-cs-line-strong bg-cs-surface p-0.5">
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          role="radio"
          aria-checked={o.value === value}
          onClick={() => onChange(o.value)}
          className={`rounded-[5px] px-2.5 py-1 text-[12px] font-medium transition-colors ${
            o.value === value ? 'bg-cs-ink text-cs-surface' : 'text-cs-ink-2 hover:text-cs-ink'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Empty({ children, hint }) {
  return (
    <div className="py-2">
      <p className="text-[13px] text-cs-ink">{children}</p>
      {hint && <p className="mt-1 text-[12px] text-cs-ink-2">{hint}</p>}
    </div>
  )
}

export function Loading() {
  return <p className="py-6 text-[13px] text-cs-ink-2">Loading…</p>
}

// A read that failed says so. It is never shown as "nothing to show".
export function Failed({ error, onRetry }) {
  const why =
    error?.code === 'not_configured'
      ? 'The console is not set up on this deployment yet.'
      : error?.status === 404
        ? 'Not found.'
        : 'Could not load this. The numbers are unknown, not zero.'
  return (
    <div className="rounded-[10px] border border-cs-line bg-cs-surface px-4 py-4">
      <p className="text-[13px] text-cs-bad">{why}</p>
      {onRetry && error?.status !== 404 && (
        <button type="button" onClick={onRetry} className="mt-2 text-[12px] font-medium text-cs-link hover:underline">
          Try again
        </button>
      )}
    </div>
  )
}

// Horizontal bars on a shared track: label, bar, value. `max` is the
// largest value in the list, so the top row fills the track.
export function Bars({ rows, max, render }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {rows.map((row, i) => {
        const { label, value, note } = render(row)
        const width = max > 0 ? Math.max(2, (value / max) * 100) : 0
        return (
          <li key={i} className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-3">
            <span className="truncate text-[13px] text-cs-ink" title={typeof label === 'string' ? label : undefined}>
              {label}
            </span>
            <span className="text-[13px] tabular-nums text-cs-ink">{fmtNumber(value)}</span>
            <span className="col-span-2 mt-1 block h-1.5 rounded-full bg-cs-line">
              <span
                className="cs-grow block h-full rounded-full bg-cs-chart"
                style={{ width: `${width}%`, animationDelay: `${i * 35}ms` }}
              />
            </span>
            {note && <span className="col-span-2 mt-0.5 text-[11.5px] text-cs-ink-2">{note}</span>}
          </li>
        )
      })}
    </ul>
  )
}
