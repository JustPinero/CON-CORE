import { google } from 'googleapis'
import { getOAuth2Client } from './google-auth'
import { decrypt } from './crypto'
import { getSupabaseAdmin } from './supabase'

export async function getGmailClient() {
  const supabase = getSupabaseAdmin()

  const { data: tokenRow, error: fetchError } = await supabase
    .from('auth_tokens')
    .select('*')
    .eq('id', 'primary')
    .single()

  if (fetchError || !tokenRow) {
    throw new Error('No stored tokens. Please login first.')
  }

  const accessToken = decrypt(tokenRow.access_token_encrypted)
  const refreshToken = decrypt(tokenRow.refresh_token_encrypted)

  const client = getOAuth2Client()
  client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  })

  return google.gmail({ version: 'v1', auth: client })
}
