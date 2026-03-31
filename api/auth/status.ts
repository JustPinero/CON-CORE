import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleCors } from '../_utils/cors'
import { getSupabaseAdmin } from '../_utils/supabase'
import { success, error, methodNotAllowed } from '../_utils/response'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return

  if (req.method !== 'GET') {
    return methodNotAllowed(res, ['GET'])
  }

  try {
    const supabase = getSupabaseAdmin()

    const { data: tokenRow, error: fetchError } = await supabase
      .from('auth_tokens')
      .select('id, token_expiry')
      .eq('id', 'primary')
      .single()

    if (fetchError || !tokenRow) {
      return success(res, { authenticated: false })
    }

    const isExpired =
      tokenRow.token_expiry && new Date(tokenRow.token_expiry) < new Date()

    return success(res, {
      authenticated: true,
      tokenExpired: !!isExpired,
    })
  } catch {
    return error(res, 500, 'Failed to check auth status')
  }
}
