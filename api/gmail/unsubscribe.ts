import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleCors } from '../_utils/cors'
import { success, error, methodNotAllowed } from '../_utils/response'
import { validateEnv } from '../_utils/env'
import { getGmailClient } from '../_utils/gmail-client'

function extractUnsubscribeUrl(header: string): string | null {
  // Try HTTP URL first
  const httpMatch = header.match(/<(https?:\/\/[^>]+)>/)
  if (httpMatch) return httpMatch[1]

  // Try mailto
  const mailtoMatch = header.match(/<(mailto:[^>]+)>/)
  if (mailtoMatch) return mailtoMatch[1]

  return null
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return

  if (req.method !== 'POST') {
    return methodNotAllowed(res, ['POST'])
  }

  try {
    validateEnv()

    const { senderAddress, action } = req.body || {}
    if (!senderAddress || typeof senderAddress !== 'string') {
      return error(res, 400, 'Missing required field: senderAddress')
    }

    const gmail = await getGmailClient()

    // Find a recent message from this sender to check for List-Unsubscribe
    const listRes = await gmail.users.messages.list({
      userId: 'me',
      q: `from:${senderAddress}`,
      maxResults: 1,
    })

    const messages = listRes.data.messages || []
    if (messages.length === 0) {
      return error(res, 404, `No messages found from ${senderAddress}`)
    }

    const detail = await gmail.users.messages.get({
      userId: 'me',
      id: messages[0].id!,
      format: 'metadata',
      metadataHeaders: ['List-Unsubscribe'],
    })

    const unsubHeader = detail.data.payload?.headers?.find(
      (h) => h.name?.toLowerCase() === 'list-unsubscribe',
    )

    if (!unsubHeader?.value) {
      return success(res, {
        hasUnsubscribe: false,
        unsubscribeUrl: null,
      })
    }

    const unsubUrl = extractUnsubscribeUrl(unsubHeader.value)

    if (!unsubUrl) {
      return success(res, {
        hasUnsubscribe: false,
        unsubscribeUrl: null,
      })
    }

    // If action === 'execute', attempt to follow the unsubscribe URL
    if (action === 'execute' && unsubUrl.startsWith('http')) {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10000)
      try {
        await fetch(unsubUrl, { signal: controller.signal })
      } catch {
        // Best-effort — many unsubscribe URLs just need to be hit
      } finally {
        clearTimeout(timeout)
      }
    }

    return success(res, {
      hasUnsubscribe: true,
      unsubscribeUrl: unsubUrl,
      executed: action === 'execute',
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unsubscribe check failed'
    return error(res, 500, message)
  }
}

export { extractUnsubscribeUrl }
