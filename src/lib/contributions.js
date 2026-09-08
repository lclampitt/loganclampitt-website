export const WEEKS = 53
export const DAYS = 7

const LIGHT_FALLBACK = ['#e8e2d8', '#a9d0d6', '#5fa8b1', '#1f6f7a', '#0e3a52']

function readVar(name, fallback) {
  if (typeof window === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return value || fallback
}

export function getLevelColors() {
  return [0, 1, 2, 3, 4].map((level) => readVar(`--git-${level}`, LIGHT_FALLBACK[level]))
}

export function getGitPopColors() {
  return {
    low: readVar('--git-pop-low', '#8fd6e0'),
    high: readVar('--git-pop-high', '#0e3a52'),
  }
}

export function seededLevel(week, day) {
  const n = (week * 17 + day * 31 + 11) % 23
  if (n > 18) return 4
  if (n > 14) return 3
  if (n > 10) return 2
  if (n > 6) return 1
  return 0
}

export function buildStylizedCells() {
  const cells = []
  for (let week = 0; week < WEEKS; week += 1) {
    for (let day = 0; day < DAYS; day += 1) {
      cells.push({
        week,
        day,
        level: seededLevel(week, day),
      })
    }
  }
  return cells
}
