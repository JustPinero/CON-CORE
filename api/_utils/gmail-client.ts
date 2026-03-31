import { google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'
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

  // Fresh client per request to avoid credential leaks across concurrent requests
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = process.env.GOOGLE_REDIRECT_URI
  const client = new OAuth2Client(clientId, clientSecret, redirectUri)
  client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  })

  return google.gmail({ version: 'v1', auth: client })
}
