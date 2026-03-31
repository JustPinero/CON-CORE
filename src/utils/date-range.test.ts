import { describe, it, expect } from 'vitest'
import { getDatesInRange, isWeekday, isWeekend, filterDatesByDayType } from './date-range'

describe('date-range utils', () => {
  it('generates dates in range', () => {
    const dates = getDatesInRange('2026-04-06', '2026-04-10')
    expect(dates).toHaveLength(5)
  })

  it('returns single date for same start and end', () => {
    const dates = getDatesInRange('2026-04-06', '2026-04-06')
    expect(dates).toHaveLength(1)
  })

  it('isWeekday returns true for Mon-Fri', () => {
    const mon = new Date(2026, 3, 6, 12) // April 6 2026 = Monday
    const fri = new Date(2026, 3, 10, 12)
    expect(isWeekday(mon)).toBe(true)
    expect(isWeekday(fri)).toBe(true)
  })

  it('isWeekday returns false for Sat-Sun', () => {
    const sat = new Date(2026, 3, 4, 12)
    const sun = new Date(2026, 3, 5, 12)
    expect(isWeekday(sat)).toBe(false)
    expect(isWeekday(sun)).toBe(false)
  })

  it('isWeekend returns true for Sat-Sun', () => {
    const sat = new Date(2026, 3, 4, 12)
    const sun = new Date(2026, 3, 5, 12)
    expect(isWeekend(sat)).toBe(true)
    expect(isWeekend(sun)).toBe(true)
  })

  it('filterDatesByDayType filters weekdays from getDatesInRange', () => {
    const dates = getDatesInRange('2026-04-06', '2026-04-12')
    const weekdays = filterDatesByDayType(dates, 'weekday')
    expect(weekdays).toHaveLength(5)
  })

  it('filterDatesByDayType filters weekends from getDatesInRange', () => {
    const dates = getDatesInRange('2026-04-06', '2026-04-12')
    const weekends = filterDatesByDayType(dates, 'weekend')
    expect(weekends).toHaveLength(2)
  })
})
