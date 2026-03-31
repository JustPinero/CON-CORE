export function getDatesInRange(startDate: string, endDate: string): Date[] {
  const dates: Date[] = []
  // Parse as local dates (noon) to avoid timezone boundary issues
  const [sy, sm, sd] = startDate.split('-').map(Number)
  const [ey, em, ed] = endDate.split('-').map(Number)
  const current = new Date(sy, sm - 1, sd, 12)
  const end = new Date(ey, em - 1, ed, 12)

  while (current <= end) {
    dates.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }

  return dates
}

export function isWeekday(date: Date): boolean {
  const day = date.getDay()
  return day >= 1 && day <= 5
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay()
  return day === 0 || day === 6
}

export function filterDatesByDayType(dates: Date[], dayType: 'weekday' | 'weekend'): Date[] {
  return dates.filter(dayType === 'weekday' ? isWeekday : isWeekend)
}

export function formatDateISO(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
