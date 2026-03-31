import type { ApiResponse } from '../utils/types'

const REQUEST_TIMEOUT = 15000

export interface CalendarEvent {
  id: string
  summary: string
  start: string
  end: string
  calendarId: string
}

interface EventInput {
  summary: string
  start: string
  end: string
  calendarId?: string
}

export async function getEvents(
  timeMin: string,
  timeMax: string,
  calendarId = 'primary',
): Promise<ApiResponse<CalendarEvent[]>> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

  try {
    const params = new URLSearchParams({ timeMin, timeMax, calendarId })
    const res = await fetch(`/api/calendar/events?${params}`, { signal: controller.signal })
    clearTimeout(timeout)
    const json = await res.json()
    if (!res.ok) return { data: null, error: json.error || 'Failed to fetch events', meta: {} }
    return json
  } catch (err) {
    clearTimeout(timeout)
    if (err instanceof DOMException && err.name === 'AbortError') {
      return { data: null, error: 'Request timed out', meta: {} }
    }
    return { data: null, error: 'Network error', meta: {} }
  }
}

export async function batchCreateEvents(
  events: EventInput[],
): Promise<ApiResponse<{ created: number; failed: number; total: number }>> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 60000)

  try {
    const res = await fetch('/api/calendar/batch-create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events }),
      signal: controller.signal,
    })
    clearTimeout(timeout)
    const json = await res.json()
    if (!res.ok) return { data: null, error: json.error || 'Failed to create events', meta: {} }
    return json
  } catch (err) {
    clearTimeout(timeout)
    if (err instanceof DOMException && err.name === 'AbortError') {
      return { data: null, error: 'Request timed out', meta: {} }
    }
    return { data: null, error: 'Network error', meta: {} }
  }
}

interface Conflict {
  proposed: { summary: string; start: string; end: string }
  existing: { summary: string; start: string; end: string }
}

export async function checkConflicts(
  events: { summary: string; start: string; end: string }[],
  calendarId = 'primary',
): Promise<ApiResponse<{ conflicts: Conflict[]; hasConflicts: boolean }>> {
  try {
    const res = await fetch('/api/calendar/conflicts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events, calendarId }),
    })
    const json = await res.json()
    if (!res.ok) return { data: null, error: json.error || 'Conflict check failed', meta: {} }
    return json
  } catch {
    return { data: null, error: 'Network error', meta: {} }
  }
}

export type { Conflict }
