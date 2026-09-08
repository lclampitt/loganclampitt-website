import { GLYPH_CELLS, PIXEL, letterSize, wordSize } from '../lib/pixel-font'

function CellBars({ cells, originX, prefix }) {
  const { cell, gap, scan } = PIXEL
  const stride = cell + gap
  const bar = (cell - scan) / 2

  return cells.map(([gx, gy], i) => {
    const x = originX + gx * stride
    const y = gy * stride
    return (
      <g key={`${prefix}-${i}`}>
        <rect x={x} y={y} width={cell} height={bar} />
        <rect x={x} y={y + bar + scan} width={cell} height={bar} />
      </g>
    )
  })
}

function GlyphLayer({ letters, prefix }) {
  const { width: letterW } = letterSize()
  const stride = letterW + PIXEL.letterGap

  return letters.map((ch, i) => (
    <CellBars
      key={`${prefix}-${ch}-${i}`}
      cells={GLYPH_CELLS[ch]}
      originX={i * stride}
      prefix={`${prefix}-${ch}${i}`}
    />
  ))
}

export default function PixelWordmark({ text = 'LOGAN', caret = false, className = '' }) {
  const known = String(text)
    .split('')
    .filter((ch) => GLYPH_CELLS[ch])
  const { width: letterW, height } = letterSize()
  const stride = letterW + PIXEL.letterGap
  const { width } = wordSize(Math.max(known.length, 1))
  const caretX = known.length * stride
  const svgW = caret ? Math.max(width, caretX + 2) : Math.max(width, 0)
  const pad = PIXEL.fringe

  return (
    <span className={`pixel-wordmark inline-block ${className}`.trim()}>
      <svg
        width={svgW || letterW}
        height={height}
        viewBox={`${-pad} ${-pad} ${(svgW || letterW) + pad * 2} ${height + pad * 2}`}
        fill="currentColor"
        overflow="visible"
        aria-hidden="true"
        shapeRendering="crispEdges"
      >
        <g className="pixel-fringe pixel-fringe-red">
          <GlyphLayer letters={known} prefix="r" />
        </g>
        <g className="pixel-fringe pixel-fringe-cyan">
          <GlyphLayer letters={known} prefix="c" />
        </g>
        <g className="pixel-fill">
          <GlyphLayer letters={known} prefix="f" />
        </g>
        {caret ? (
          <rect className="pixel-caret" x={caretX} y={0} width={2} height={height} />
        ) : null}
      </svg>
    </span>
  )
}
