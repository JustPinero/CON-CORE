import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleCors } from '../_utils/cors'
import { success, error, methodNotAllowed } from '../_utils/response'
import { validateEnv } from '../_utils/env'
import { getCalendarClient } from '../_utils/calendar-client'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return

  if (req.method !== 'GET') {
    return methodNotAllowed(res, ['GET'])
  }

  try {
    validateEnv()

    const timeMin = req.query.timeMin as string | undefined
    const timeMax = req.query.timeMax as string | undefined
    const calendarId = (req.query.calendarId as string) || 'primary'

    if (!timeMin || !timeMax) {
      return error(res, 400, 'Missing required query params: timeMin, timeMax (ISO 8601)')
    }

    const calendar = await getCalendarClient()

    const eventsRes = await calendar.events.list({
      calendarId,
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 250,
    })

    const events = (eventsRes.data.items || []).map((e) => ({
      id: e.id,
      summary: e.summary || '(No title)',
      start: e.start?.dateTime || e.start?.date,
      end: e.end?.dateTime || e.end?.date,
      calendarId,
    }))

    return success(res, events, { count: events.length })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch events'
    if (message.includes('invalid_grant') || message.includes('Token has been expired')) {
      return error(res, 401, 'Token expired. Please refresh or re-login.')
    }
    return error(res, 500, message)
  }
}
