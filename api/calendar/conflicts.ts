import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleCors } from '../_utils/cors'
import { success, error, methodNotAllowed } from '../_utils/response'
import { validateEnv } from '../_utils/env'
import { getCalendarClient } from '../_utils/calendar-client'

interface ProposedEvent {
  summary: string
  start: string
  end: string
}

interface Conflict {
  proposed: ProposedEvent
  existing: { summary: string; start: string; end: string }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return

  if (req.method !== 'POST') {
    return methodNotAllowed(res, ['POST'])
  }

  try {
    validateEnv()

    const { events, calendarId = 'primary' } = req.body || {}
    if (!Array.isArray(events) || events.length === 0) {
      return error(res, 400, 'Missing required field: events (array)')
    }

    const calendar = await getCalendarClient()

    // Find the overall time range
    const allStarts = events.map((e: ProposedEvent) => new Date(e.start).getTime())
    const allEnds = events.map((e: ProposedEvent) => new Date(e.end).getTime())
    const timeMin = new Date(Math.min(...allStarts)).toISOString()
    const timeMax = new Date(Math.max(...allEnds)).toISOString()

    const existingRes = await calendar.events.list({
      calendarId,
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 250,
    })

    const existing = (existingRes.data.items || []).map((e) => ({
      summary: e.summary || '(No title)',
      start: e.start?.dateTime || e.start?.date || '',
      end: e.end?.dateTime || e.end?.date || '',
    }))

    const conflicts: Conflict[] = []

    for (const proposed of events as ProposedEvent[]) {
      const pStart = new Date(proposed.start).getTime()
      const pEnd = new Date(proposed.end).getTime()

      for (const ex of existing) {
        const eStart = new Date(ex.start).getTime()
        const eEnd = new Date(ex.end).getTime()

        // Overlap: starts before the other ends AND ends after the other starts
        if (pStart < eEnd && pEnd > eStart) {
          conflicts.push({ proposed, existing: ex })
        }
      }
    }

    return success(res, { conflicts, hasConflicts: conflicts.length > 0 }, { checkedEvents: events.length })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Conflict check failed'
    return error(res, 500, message)
  }
}
