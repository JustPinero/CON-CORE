import type { VercelRequest, VercelResponse } from '@vercel/node'
import { randomBytes } from 'crypto'
import { getOAuth2Client, SCOPES } from '../_utils/google-auth'
import { error, methodNotAllowed } from '../_utils/response'
import { validateEnv } from '../_utils/env'

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return methodNotAllowed(res, ['GET'])
  }

  try {
    validateEnv()
    const client = getOAuth2Client()
    const state = randomBytes(32).toString('hex')

    res.setHeader(
      'Set-Cookie',
      `oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/api/auth; Max-Age=600`,
    )

    const url = client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent',
      state,
    })
    return res.redirect(302, url)
  } catch (err) {
    return error(res, 500, err instanceof Error ? err.message : 'Failed to generate auth URL')
  }
}
