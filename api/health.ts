import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleCors } from './_utils/cors'
import { success, methodNotAllowed } from './_utils/response'

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return

  if (req.method !== 'GET') {
    return methodNotAllowed(res, ['GET'])
  }

  return success(res, { status: 'ok' }, { timestamp: new Date().toISOString() })
}
