import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleCors } from '../_utils/cors'
import { success, error, methodNotAllowed } from '../_utils/response'
import { validateEnv } from '../_utils/env'
import { getCalendarClient } from '../_utils/calendar-client'

interface EventInput {
  summary: string
  start: string
  end: string
  calendarId?: string
}

const BATCH_DELAY = 200

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return

  if (req.method !== 'POST') {
    return methodNotAllowed(res, ['POST'])
  }

  try {
    validateEnv()

    const { events } = req.body || {}
    if (!Array.isArray(events) || events.length === 0) {
      return error(res, 400, 'Missing required field: events (array)')
    }

    const calendar = await getCalendarClient()

    let created = 0
    let failed = 0

    for (const event of events as EventInput[]) {
      if (!event.summary || !event.start || !event.end) {
        failed++
        continue
      }
      try {
        await calendar.events.insert({
          calendarId: event.calendarId || 'primary',
          requestBody: {
            summary: event.summary,
            start: { dateTime: event.start },
            end: { dateTime: event.end },
          },
        })
        created++
      } catch {
        failed++
      }

      if (created + failed < events.length) {
        await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY))
      }
    }

    return success(res, { created, failed, total: events.length })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create events'
    if (message.includes('invalid_grant') || message.includes('Token has been expired')) {
      return error(res, 401, 'Token expired. Please refresh or re-login.')
    }
    return error(res, 500, message)
  }
}
