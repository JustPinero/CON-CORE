import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleCors } from '../_utils/cors'
import { success, error, methodNotAllowed } from '../_utils/response'
import { validateEnv } from '../_utils/env'
import { getGmailClient } from '../_utils/gmail-client'

interface SenderEntry {
  senderAddress: string
  senderName: string
  messageCount: number
}

const PAGE_SIZE = 500
const MAX_PAGES = 20

function parseSender(from: string): { address: string; name: string } {
  // Duplicated from src/utils/email.ts for serverless isolation
  const match = from.match(/^(?:"?([^"]*)"?\s)?<?([^>]+@[^>]+)>?$/)
  if (match) {
    return { name: match[1]?.trim() || match[2], address: match[2].toLowerCase() }
  }
  return { name: from, address: from.toLowerCase() }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return

  if (req.method !== 'GET') {
    return methodNotAllowed(res, ['GET'])
  }

  try {
    validateEnv()
    const gmail = await getGmailClient()

    const senderMap = new Map<string, SenderEntry>()
    let pageToken: string | undefined
    let pageCount = 0

    do {
      const listRes = await gmail.users.messages.list({
        userId: 'me',
        maxResults: PAGE_SIZE,
        pageToken,
        q: 'in:anywhere',
      })

      const messages = listRes.data.messages || []

      // Batch fetch message headers (From field only)
      const batchSize = 50
      for (let i = 0; i < messages.length; i += batchSize) {
        const batch = messages.slice(i, i + batchSize)

        const details = await Promise.all(
          batch.map((msg) =>
            gmail.users.messages.get({
              userId: 'me',
              id: msg.id!,
              format: 'metadata',
              metadataHeaders: ['From'],
            }),
          ),
        )

        for (const detail of details) {
          const fromHeader = detail.data.payload?.headers?.find(
            (h) => h.name?.toLowerCase() === 'from',
          )
          if (!fromHeader?.value) continue

          const { address, name } = parseSender(fromHeader.value)
          const existing = senderMap.get(address)
          if (existing) {
            existing.messageCount++
          } else {
            senderMap.set(address, {
              senderAddress: address,
              senderName: name,
              messageCount: 1,
            })
          }
        }

        // Rate limiting: delay between batches (250 quota units/sec)
        if (i + batchSize < messages.length) {
          await new Promise((resolve) => setTimeout(resolve, 100))
        }
      }

      pageToken = listRes.data.nextPageToken || undefined
      pageCount++
    } while (pageToken && pageCount < MAX_PAGES)

    const senders = Array.from(senderMap.values()).sort(
      (a, b) => b.messageCount - a.messageCount,
    )

    return success(res, senders, {
      totalSenders: senders.length,
      pagesScanned: pageCount,
      truncated: pageCount >= MAX_PAGES,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch senders'

    if (message.includes('invalid_grant') || message.includes('Token has been expired')) {
      return error(res, 401, 'Token expired. Please refresh or re-login.')
    }

    return error(res, 500, message)
  }
}
