export const WEEKS = 53
export const DAYS = 7
export const LEVEL_COLORS = ['#27272a', '#3f3110', '#6d5414', '#a37d14', '#d4a017']

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
