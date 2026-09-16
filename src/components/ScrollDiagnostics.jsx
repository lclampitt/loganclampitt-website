import { useEffect, useRef, useState } from 'react'
import { getLenis } from '../lib/scroll'

const TOGGLES = [
  { key: 'portrait', label: 'Hide portrait', className: 'diag-no-portrait' },
  { key: 'grid', label: 'Hide GitHub grid', className: 'diag-no-grid' },
  { key: 'smooth', label: 'Smooth scroll off' },
]

const STYLE = `
.diag-no-portrait .dot-portrait { display: none !important; }
.diag-no-grid .git-graph { display: none !important; }
`

function summarize(intervals, refresh) {
  if (!intervals.length) return null
  const sorted = [...intervals].sort((a, b) => a - b)
  const pick = (p) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))]
  const dropped = intervals.filter((ms) => ms > refresh * 1.5).length
  return {
    frames: intervals.length,
    fps: Math.round(1000 / pick(0.5)),
    p95: pick(0.95).toFixed(1),
    worst: sorted.at(-1).toFixed(0),
    droppedPct: Math.round((dropped / intervals.length) * 100),
  }
}

export default function ScrollDiagnostics() {
  const [open, setOpen] = useState(true)
  const [flags, setFlags] = useState({ portrait: false, grid: false, smooth: false })
  const [stats, setStats] = useState(null)
  const data = useRef({ scroll: [], idle: [], longFrames: [], lastScroll: 0, wheel: [] })

  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = STYLE
    document.head.appendChild(style)
    return () => style.remove()
  }, [])

  useEffect(() => {
    const root = document.documentElement
    TOGGLES.forEach(({ key, className }) => {
      if (className) root.classList.toggle(className, flags[key])
    })
    const lenis = getLenis()
    if (lenis) lenis.options.smoothWheel = !flags.smooth
  }, [flags])

  useEffect(() => {
    const d = data.current
    let raf = 0
    let last = performance.now()

    const frame = (t) => {
      const gap = t - last
      last = t
      if (gap < 500) (t - d.lastScroll < 120 ? d.scroll : d.idle).push(gap)
      if (d.idle.length > 600) d.idle.splice(0, 300)
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    const onScroll = () => {
      d.lastScroll = performance.now()
    }
    const onWheel = (e) => {
      d.wheel.push(Math.abs(e.deltaY))
      if (d.wheel.length > 20) d.wheel.shift()
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('wheel', onWheel, { passive: true })

    let observer
    try {
      observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.startTime < d.lastScroll - 200) return
          const script = entry.scripts?.[0]
          const source = script
            ? `${(script.sourceURL || '').split('/').pop().split('?')[0] || 'inline'} ${script.invoker || ''}`.trim()
            : 'rendering'
          d.longFrames.push({ ms: Math.round(entry.duration), source })
        })
      })
      observer.observe({ type: 'long-animation-frame', buffered: false })
    } catch {
      observer = null
    }

    const id = window.setInterval(() => {
      const idleSorted = [...d.idle].sort((a, b) => a - b)
      const refresh = idleSorted.length ? idleSorted[Math.floor(idleSorted.length / 2)] : 16.7
      const counts = {}
      d.longFrames.forEach(({ source }) => {
        counts[source] = (counts[source] || 0) + 1
      })
      const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3)
      const avgWheel = d.wheel.length ? d.wheel.reduce((a, b) => a + b, 0) / d.wheel.length : null
      setStats({
        refreshHz: Math.round(1000 / refresh),
        scroll: summarize(d.scroll, refresh),
        longFrames: d.longFrames.length,
        worstLong: d.longFrames.reduce((m, f) => Math.max(m, f.ms), 0),
        top,
        input: avgWheel == null ? '—' : avgWheel < 50 ? `trackpad-like (${avgWheel.toFixed(1)})` : `mouse wheel (${avgWheel.toFixed(0)})`,
        loafSupported: Boolean(observer),
      })
    }, 500)

    return () => {
      cancelAnimationFrame(raf)
      window.clearInterval(id)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('wheel', onWheel)
      observer?.disconnect()
    }
  }, [])

  const reset = () => {
    const d = data.current
    d.scroll = []
    d.longFrames = []
    d.wheel = []
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed top-3 left-3 z-[300] px-2 py-1 rounded-md bg-black text-white font-mono text-[11px]"
      >
        diag
      </button>
    )
  }

  const s = stats?.scroll
  return (
    <div className="fixed top-3 left-3 z-[300] w-72 rounded-xl bg-neutral-950/95 text-white font-mono text-[11px] leading-relaxed p-3 shadow-2xl border border-neutral-800">
      <div className="flex justify-between mb-1">
        <span className="font-semibold">Scroll diagnostics · {import.meta.env.DEV ? 'dev' : 'production'}</span>
        <button type="button" onClick={() => setOpen(false)} className="text-neutral-400">hide</button>
      </div>
      <p className="text-neutral-400">Screen: {stats?.refreshHz ?? '…'}Hz · DPR {window.devicePixelRatio} · {stats?.input}</p>
      {s ? (
        <p>
          While scrolling: <b>{s.fps} fps</b> · dropped <b className={s.droppedPct > 5 ? 'text-red-400' : 'text-green-400'}>{s.droppedPct}%</b>
          <br />p95 {s.p95}ms · worst {s.worst}ms · {s.frames} frames
        </p>
      ) : (
        <p className="text-neutral-400">Scroll the page to collect data…</p>
      )}
      {stats?.loafSupported && (
        <p>
          Long frames: {stats.longFrames}{stats.longFrames ? ` (worst ${stats.worstLong}ms)` : ''}
          {stats.top.map(([src, n]) => (
            <span key={src} className="block text-neutral-400 truncate">· {n}× {src}</span>
          ))}
        </p>
      )}
      <div className="mt-2 space-y-1">
        {TOGGLES.map(({ key, label }) => (
          <label key={key} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={flags[key]}
              onChange={(e) => {
                setFlags((f) => ({ ...f, [key]: e.target.checked }))
                reset()
              }}
            />
            {label}
          </label>
        ))}
      </div>
      <button type="button" onClick={reset} className="mt-2 w-full rounded-md border border-neutral-700 py-1 hover:bg-neutral-800">
        Reset stats
      </button>
    </div>
  )
}
