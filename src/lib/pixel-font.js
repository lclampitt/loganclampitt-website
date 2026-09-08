export const PIXEL = {
  cell: 6,
  gap: 1,
  letterGap: 4,
  fringe: 1,
  scan: 1,
  cols: 5,
  rows: 11,
}

export const GLYPHS = {
  L: [
    '10000',
    '10000',
    '10000',
    '10000',
    '10000',
    '10000',
    '10000',
    '10000',
    '10000',
    '10000',
    '11111',
  ],
  O: [
    '11111',
    '10001',
    '10001',
    '10001',
    '10001',
    '10001',
    '10001',
    '10001',
    '10001',
    '10001',
    '11111',
  ],
  G: [
    '11111',
    '10000',
    '10000',
    '10000',
    '10000',
    '10111',
    '10001',
    '10001',
    '10001',
    '10001',
    '11111',
  ],
  A: [
    '11111',
    '10001',
    '10001',
    '10001',
    '10001',
    '11111',
    '10001',
    '10001',
    '10001',
    '10001',
    '10001',
  ],
  N: [
    '10001',
    '11001',
    '11001',
    '10101',
    '10101',
    '10101',
    '10011',
    '10011',
    '10001',
    '10001',
    '10001',
  ],
}

export function letterSize() {
  const { cell, gap, cols, rows } = PIXEL
  return {
    width: cols * cell + (cols - 1) * gap,
    height: rows * cell + (rows - 1) * gap,
  }
}

export function wordSize(count) {
  const { letterGap } = PIXEL
  const { width, height } = letterSize()
  if (count <= 0) return { width: 0, height }
  return {
    width: count * width + (count - 1) * letterGap,
    height,
  }
}

export function glyphCells(letter) {
  const rows = GLYPHS[letter]
  if (!rows) return []
  const cells = []
  for (let y = 0; y < rows.length; y += 1) {
    const row = rows[y]
    for (let x = 0; x < row.length; x += 1) {
      if (row[x] === '1') cells.push([x, y])
    }
  }
  return cells
}

export const GLYPH_CELLS = Object.fromEntries(
  Object.keys(GLYPHS).map((letter) => [letter, glyphCells(letter)]),
)
