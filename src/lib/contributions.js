export const WEEKS = 53
export const DAYS = 7

const CONTRIBUTIONS_API = 'https://github-contributions-api.jogruber.de/v4'
const LIGHT_FALLBACK = ['#e8e2d8', '#f5bd88', '#f7a867', '#ff7900', '#c95c00']

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
    low: readVar('--git-pop-low', '#ffb877'),
    high: readVar('--git-pop-high', '#ff9433'),
  }
}

export function emptyCells() {
  const cells = []
  for (let week = 0; week < WEEKS; week += 1) {
    for (let day = 0; day < DAYS; day += 1) {
      cells.push({ week, day, level: 0, date: null, count: 0 })
    }
  }
  return cells
}

// Lays out the last year of GitHub contributions on a Sunday-first week grid ending today.
export async function fetchContributionCells(username, signal) {
  const res = await fetch(`${CONTRIBUTIONS_API}/${encodeURIComponent(username)}?y=last`, { signal })
  if (!res.ok) throw new Error(`Contributions request failed: ${res.status}`)
  const data = await res.json()

  const days = data.contributions.slice(-WEEKS * DAYS)
  const lastWeekday = new Date(`${days[days.length - 1].date}T00:00:00Z`).getUTCDay()
  const lastIndex = (WEEKS - 1) * DAYS + lastWeekday
  const cells = emptyCells()

  days.forEach((entry, i) => {
    const index = lastIndex - (days.length - 1 - i)
    if (index < 0) return
    cells[index] = {
      week: Math.floor(index / DAYS),
      day: index % DAYS,
      level: Math.max(0, Math.min(4, entry.level)),
      date: entry.date,
      count: entry.count,
    }
  })

  return { cells, total: data.total?.lastYear ?? days.reduce((sum, d) => sum + d.count, 0) }
}
