import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getOAuth2Client } from '../_utils/google-auth'
import { encrypt } from '../_utils/crypto'
import { getSupabaseAdmin } from '../_utils/supabase'
import { error, methodNotAllowed } from '../_utils/response'
import { validateEnv } from '../_utils/env'

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  if (!cookieHeader) return {}
  return Object.fromEntries(
    cookieHeader.split(';').map((c) => {
      const [key, ...rest] = c.trim().split('=')
      return [key, rest.join('=')]
    }),
  )
}

function getAppBaseUrl(): string {
  return process.env.VITE_SUPABASE_URL
    ? process.env.GOOGLE_REDIRECT_URI!.replace('/api/auth/callback', '')
    : '/'
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return methodNotAllowed(res, ['GET'])
  }

  try {
    validateEnv()

    const code = req.query.code as string | undefined
    const state = req.query.state as string | undefined

    if (!code) {
      return error(res, 400, 'Missing authorization code')
    }

    // CSRF protection: validate state parameter
    const cookies = parseCookies(req.headers.cookie)
    const storedState = cookies.oauth_state

    if (!state || !storedState || state !== storedState) {
      return error(res, 403, 'Invalid OAuth state parameter')
    }

    // Clear the state cookie
    res.setHeader(
      'Set-Cookie',
      'oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/api/auth; Max-Age=0',
    )

    const client = getOAuth2Client()
    const { tokens } = await client.getToken(code)

    if (!tokens.access_token || !tokens.refresh_token) {
      return error(res, 400, 'Failed to obtain tokens')
    }

    const supabase = getSupabaseAdmin()

    const encryptedAccess = encrypt(tokens.access_token)
    const encryptedRefresh = encrypt(tokens.refresh_token)
    const expiry = tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null

    const { error: dbError } = await supabase.from('auth_tokens').upsert(
      {
        id: 'primary',
        access_token_encrypted: encryptedAccess,
        refresh_token_encrypted: encryptedRefresh,
        token_expiry: expiry,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' },
    )

    if (dbError) {
      return error(res, 500, `Database error: ${dbError.message}`)
    }

    const baseUrl = getAppBaseUrl()
    return res.redirect(302, `${baseUrl}?auth=success`)
  } catch (err) {
    return error(res, 500, err instanceof Error ? err.message : 'OAuth callback failed')
  }
}
