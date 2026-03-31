import type { VercelResponse } from '@vercel/node'

interface ApiPayload<T> {
  data: T | null
  error: string | null
  meta: Record<string, unknown>
}

export function success<T>(res: VercelResponse, data: T, meta: Record<string, unknown> = {}) {
  return res.status(200).json({ data, error: null, meta } satisfies ApiPayload<T>)
}

export function error(res: VercelResponse, status: number, message: string) {
  return res.status(status).json({ data: null, error: message, meta: {} } satisfies ApiPayload<null>)
}

export function methodNotAllowed(res: VercelResponse, allowed: string[]) {
  res.setHeader('Allow', allowed.join(', '))
  return error(res, 405, `Method not allowed. Use: ${allowed.join(', ')}`)
}
