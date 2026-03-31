import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleCors } from '../_utils/cors'
import { success, error, methodNotAllowed } from '../_utils/response'
import { validateEnv } from '../_utils/env'
import { getGmailClient } from '../_utils/gmail-client'

const BATCH_SIZE = 100
const BATCH_DELAY = 500

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return

  if (req.method !== 'POST') {
    return methodNotAllowed(res, ['POST'])
  }

  try {
    validateEnv()

    const { senderAddress } = req.body || {}
    if (!senderAddress || typeof senderAddress !== 'string') {
      return error(res, 400, 'Missing required field: senderAddress')
    }

    const gmail = await getGmailClient()

    // Collect all message IDs from this sender
    const messageIds: string[] = []
    let pageToken: string | undefined

    do {
      const listRes = await gmail.users.messages.list({
        userId: 'me',
        q: `from:${senderAddress}`,
        maxResults: 500,
        pageToken,
      })

      const messages = listRes.data.messages || []
      messageIds.push(...messages.map((m) => m.id!))
      pageToken = listRes.data.nextPageToken || undefined
    } while (pageToken)

    if (messageIds.length === 0) {
      return success(res, { archived: 0 })
    }

    // Batch archive (remove INBOX label) in chunks
    let archived = 0
    let failed = 0
    for (let i = 0; i < messageIds.length; i += BATCH_SIZE) {
      const batch = messageIds.slice(i, i + BATCH_SIZE)
      try {
        await gmail.users.messages.batchModify({
          userId: 'me',
          requestBody: {
            ids: batch,
            removeLabelIds: ['INBOX'],
          },
        })
        archived += batch.length
      } catch {
        failed += batch.length
      }

      if (i + BATCH_SIZE < messageIds.length) {
        await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY))
      }
    }

    return success(res, { archived, failed }, { senderAddress })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Batch archive failed'
    if (message.includes('invalid_grant') || message.includes('Token has been expired')) {
      return error(res, 401, 'Token expired. Please refresh or re-login.')
    }
    return error(res, 500, message)
  }
}
