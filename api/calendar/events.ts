import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleCors } from '../_utils/cors'
import { error, methodNotAllowed } from '../_utils/response'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return

  if (req.method !== 'GET') {
    return methodNotAllowed(res, ['GET'])
  }

  return error(res, 501, 'Not implemented')
}
