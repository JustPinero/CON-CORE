import { describe, it, expect } from 'vitest'
import { getDatesInRange, filterDatesByDayType } from '../../utils/date-range'

// Test the generateEvents logic inline (same logic as DeploySchedule)
function generateEvents(
  dayType: 'weekday' | 'weekend',
  timeBlocks: { startTime: string; endTime: string; label: string }[],
  startDate: string,
  endDate: string,
) {
  const allDates = getDatesInRange(startDate, endDate)
  const matchingDates = filterDatesByDayType(allDates, dayType)

  return matchingDates.flatMap((date) => {
    const dateStr = date.toISOString().split('T')[0]
    return timeBlocks.map((block) => ({
      summary: block.label,
      start: `${dateStr}T${block.startTime}:00`,
      end: `${dateStr}T${block.endTime}:00`,
    }))
  })
}

describe('deploy schedule logic', () => {
  it('generates events only for weekdays', () => {
    const events = generateEvents(
      'weekday',
      [{ startTime: '09:00', endTime: '17:00', label: 'Work' }],
      '2026-04-06', // Monday
      '2026-04-12', // Sunday (7 days)
    )
    expect(events).toHaveLength(5) // Mon-Fri
  })

  it('generates events only for weekends', () => {
    const events = generateEvents(
      'weekend',
      [{ startTime: '10:00', endTime: '12:00', label: 'Relax' }],
      '2026-04-06', // Monday
      '2026-04-12', // Sunday (7 days)
    )
    expect(events).toHaveLength(2) // Sat+Sun
  })

  it('generates multiple blocks per day', () => {
    const events = generateEvents(
      'weekday',
      [
        { startTime: '09:00', endTime: '12:00', label: 'Focus' },
        { startTime: '13:00', endTime: '17:00', label: 'Meetings' },
      ],
      '2026-04-06', // Monday
      '2026-04-06', // Monday (1 day)
    )
    expect(events).toHaveLength(2)
    expect(events[0].summary).toBe('Focus')
    expect(events[1].summary).toBe('Meetings')
  })

  it('returns empty for weekend template on weekday-only range', () => {
    const events = generateEvents(
      'weekend',
      [{ startTime: '10:00', endTime: '12:00', label: 'Rest' }],
      '2026-04-06', // Monday
      '2026-04-10', // Friday
    )
    expect(events).toHaveLength(0)
  })

  it('generates correct date-time strings', () => {
    const events = generateEvents(
      'weekday',
      [{ startTime: '09:00', endTime: '10:00', label: 'Standup' }],
      '2026-04-06',
      '2026-04-06',
    )
    expect(events[0].start).toBe('2026-04-06T09:00:00')
    expect(events[0].end).toBe('2026-04-06T10:00:00')
  })
})
