import { describe, it, expect, beforeEach } from 'vitest'
import { validateTimeBlocks, getTemplates, createTemplate, updateTemplate, deleteTemplate } from './schedule'
import type { TimeBlock } from '../utils/types'

describe('validateTimeBlocks', () => {
  it('returns null for valid non-overlapping blocks', () => {
    const blocks: TimeBlock[] = [
      { startTime: '09:00', endTime: '10:00', label: 'Meeting', calendarId: 'primary' },
      { startTime: '10:00', endTime: '11:00', label: 'Focus', calendarId: 'primary' },
    ]
    expect(validateTimeBlocks(blocks)).toBeNull()
  })

  it('rejects end <= start', () => {
    const blocks: TimeBlock[] = [
      { startTime: '10:00', endTime: '09:00', label: 'Bad', calendarId: 'primary' },
    ]
    expect(validateTimeBlocks(blocks)).toContain('End time must be after start time')
  })

  it('rejects equal start and end', () => {
    const blocks: TimeBlock[] = [
      { startTime: '10:00', endTime: '10:00', label: 'Zero', calendarId: 'primary' },
    ]
    expect(validateTimeBlocks(blocks)).toContain('End time must be after start time')
  })

  it('rejects overlapping blocks', () => {
    const blocks: TimeBlock[] = [
      { startTime: '09:00', endTime: '10:30', label: 'First', calendarId: 'primary' },
      { startTime: '10:00', endTime: '11:00', label: 'Second', calendarId: 'primary' },
    ]
    expect(validateTimeBlocks(blocks)).toContain('overlap')
  })

  it('returns null for empty blocks', () => {
    expect(validateTimeBlocks([])).toBeNull()
  })
})

describe('schedule CRUD', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('creates and retrieves a template', async () => {
    const result = await createTemplate({
      name: 'Weekday',
      dayType: 'weekday',
      timeBlocks: [{ startTime: '09:00', endTime: '17:00', label: 'Work', calendarId: 'primary' }],
    })
    expect(result.data).toBeDefined()
    expect(result.data!.name).toBe('Weekday')
    expect(result.data!.id).toBeTruthy()

    const list = await getTemplates()
    expect(list.data).toHaveLength(1)
  })

  it('rejects creation with invalid time blocks', async () => {
    const result = await createTemplate({
      name: 'Bad',
      dayType: 'weekday',
      timeBlocks: [{ startTime: '17:00', endTime: '09:00', label: 'Reversed', calendarId: 'primary' }],
    })
    expect(result.error).toContain('End time must be after start time')
    expect(result.data).toBeNull()
  })

  it('updates a template', async () => {
    const created = await createTemplate({
      name: 'Original',
      dayType: 'weekday',
      timeBlocks: [],
    })
    const updated = await updateTemplate(created.data!.id, { name: 'Renamed' })
    expect(updated.data!.name).toBe('Renamed')
  })

  it('deletes a template', async () => {
    const created = await createTemplate({ name: 'ToDelete', dayType: 'weekend', timeBlocks: [] })
    const result = await deleteTemplate(created.data!.id)
    expect(result.data!.deleted).toBe(true)

    const list = await getTemplates()
    expect(list.data).toHaveLength(0)
  })

  it('returns error when deleting nonexistent template', async () => {
    const result = await deleteTemplate('nonexistent-id')
    expect(result.error).toBe('Template not found')
  })
})
