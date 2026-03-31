import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getOAuth2Client, SCOPES } from '../_utils/google-auth'
import { error, methodNotAllowed } from '../_utils/response'

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return methodNotAllowed(res, ['GET'])
  }

  try {
    const client = getOAuth2Client()
    const url = client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent',
    })
    return res.redirect(302, url)
  } catch (err) {
    return error(res, 500, err instanceof Error ? err.message : 'Failed to generate auth URL')
  }
}
