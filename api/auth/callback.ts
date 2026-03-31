import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getOAuth2Client } from '../_utils/google-auth'
import { encrypt } from '../_utils/crypto'
import { getSupabaseAdmin } from '../_utils/supabase'
import { error, methodNotAllowed } from '../_utils/response'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return methodNotAllowed(res, ['GET'])
  }

  const code = req.query.code as string | undefined

  if (!code) {
    return error(res, 400, 'Missing authorization code')
  }

  try {
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

    const redirectUrl = process.env.GOOGLE_REDIRECT_URI?.replace('/api/auth/callback', '') || '/'
    return res.redirect(302, redirectUrl)
  } catch (err) {
    return error(res, 500, err instanceof Error ? err.message : 'OAuth callback failed')
  }
}
