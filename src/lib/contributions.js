export const WEEKS = 53
export const DAYS = 7
export const LEVEL_COLORS = ['#27272a', '#3f3110', '#6d5414', '#a37d14', '#d4a017']
export const GITHUB_USER = 'lclampitt'

function startOfSunday(date) {
  const next = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  next.setUTCDate(next.getUTCDate() - next.getUTCDay())
  return next
}

export function calendarStart(today = new Date()) {
  const end = startOfSunday(today)
  const start = new Date(end)
  start.setUTCDate(start.getUTCDate() - (WEEKS - 1) * 7)
  return start
}

export function isoDate(date) {
  return date.toISOString().slice(0, 10)
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
  const start = calendarStart()
  const cells = []
  for (let week = 0; week < WEEKS; week += 1) {
    for (let day = 0; day < DAYS; day += 1) {
      const date = new Date(start)
      date.setUTCDate(start.getUTCDate() + week * 7 + day)
      cells.push({
        week,
        day,
        date: isoDate(date),
        level: seededLevel(week, day),
        count: 0,
      })
    }
  }
  return cells
}

export function countToLevel(count) {
  if (count > 8) return 4
  if (count > 4) return 3
  if (count > 1) return 2
  if (count > 0) return 1
  return 0
}

export function parseJoguber(payload) {
  const list = payload?.contributions
  if (!Array.isArray(list) || list.length === 0) return null

  const last = list.slice(-WEEKS * DAYS)
  if (last.every((item) => !item.count && !item.level)) return null

  return last.map((item, index) => ({
    week: Math.floor(index / DAYS),
    day: index % DAYS,
    date: item.date,
    count: item.count || 0,
    level: Math.max(
      0,
      Math.min(4, item.level ?? countToLevel(item.count || 0)),
    ),
  }))
}

export function parseActivityList(list) {
  if (!Array.isArray(list) || list.length === 0) return null
  const last = list.slice(-WEEKS * DAYS)
  if (last.every((item) => !item.count && !item.level)) return null
  return last.map((item, index) => ({
    week: Math.floor(index / DAYS),
    day: index % DAYS,
    date: item.date,
    count: item.count || 0,
    level: Math.max(0, Math.min(4, item.level ?? countToLevel(item.count || 0))),
  }))
}

export function monthLabels(cells) {
  const labels = []
  let last = ''
  cells.forEach((cell) => {
    if (cell.day !== 0) return
    const month = new Date(`${cell.date}T00:00:00Z`).toLocaleString('en-US', {
      month: 'short',
      timeZone: 'UTC',
    })
    if (month === last) return
    last = month
    labels.push({ week: cell.week, label: month })
  })
  return labels
}
