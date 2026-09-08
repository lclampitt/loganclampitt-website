import { useCallback, useState } from 'react'

export default function MagicHover({ children, className = '' }) {
  const [pos, setPos] = useState({ x: 50, y: 50, on: false })

  const onMove = useCallback((event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setPos({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      on: true,
    })
  }, [])

  const onLeave = useCallback(() => {
    setPos((current) => ({ ...current, on: false }))
  }, [])

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute z-0 h-40 w-40 rounded-full bg-accent/12"
        style={{
          left: pos.x,
          top: pos.y,
          opacity: pos.on ? 1 : 0,
          transform: 'translate(-50%, -50%)',
          transition: 'opacity 200ms ease',
        }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  )
}
