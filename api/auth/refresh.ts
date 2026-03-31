import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getOAuth2Client } from '../_utils/google-auth'
import { encrypt, decrypt } from '../_utils/crypto'
import { getSupabaseAdmin } from '../_utils/supabase'
import { success, error, methodNotAllowed } from '../_utils/response'
import { handleCors } from '../_utils/cors'
import { validateEnv } from '../_utils/env'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return

  if (req.method !== 'POST') {
    return methodNotAllowed(res, ['POST'])
  }

  try {
    validateEnv()
    const supabase = getSupabaseAdmin()

    const { data: tokenRow, error: fetchError } = await supabase
      .from('auth_tokens')
      .select('*')
      .eq('id', 'primary')
      .single()

    if (fetchError || !tokenRow) {
      return error(res, 401, 'No stored tokens found. Please login first.')
    }

    const refreshToken = decrypt(tokenRow.refresh_token_encrypted)
    const client = getOAuth2Client()
    client.setCredentials({ refresh_token: refreshToken })

    const { credentials } = await client.refreshAccessToken()

    if (!credentials.access_token) {
      return error(res, 500, 'Failed to refresh access token')
    }

    const encryptedAccess = encrypt(credentials.access_token)
    const expiry = credentials.expiry_date
      ? new Date(credentials.expiry_date).toISOString()
      : null

    const { error: updateError } = await supabase
      .from('auth_tokens')
      .update({
        access_token_encrypted: encryptedAccess,
        token_expiry: expiry,
        updated_at: new Date().toISOString(),
      })
      .eq('id', 'primary')

    if (updateError) {
      return error(res, 500, `Failed to update tokens: ${updateError.message}`)
    }

    return success(res, { tokenExpiry: expiry })
  } catch (err) {
    return error(res, 500, err instanceof Error ? err.message : 'Token refresh failed')
  }
}
