import type { VercelRequest, VercelResponse } from '@vercel/node'
import { success, methodNotAllowed } from './_utils/response'

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return methodNotAllowed(res, ['GET'])
  }

  return success(res, { status: 'ok' }, { timestamp: new Date().toISOString() })
}
