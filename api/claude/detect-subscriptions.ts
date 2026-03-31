import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleCors } from '../_utils/cors'
import { success, error, methodNotAllowed } from '../_utils/response'
import { validateEnv } from '../_utils/env'
import { getGmailClient } from '../_utils/gmail-client'
import { getClaudeClient, stripCodeFences, CLAUDE_MODEL, CLAUDE_TIMEOUT } from '../_utils/claude-client'

interface DetectedSubscription {
  serviceName: string
  monthlyCost: number
  category: string
  detectedSince: string
  lastCharge: string
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return

  if (req.method !== 'POST') {
    return methodNotAllowed(res, ['POST'])
  }

  try {
    validateEnv()

    const gmail = await getGmailClient()

    // Search for receipt/payment emails
    const listRes = await gmail.users.messages.list({
      userId: 'me',
      q: 'subject:(receipt OR payment OR invoice OR subscription OR charged OR billing) newer_than:6m',
      maxResults: 100,
    })

    const messages = listRes.data.messages || []
    if (messages.length === 0) {
      return success(res, [], { message: 'No receipt emails found' })
    }

    // Fetch subject lines + dates
    const receipts: { subject: string; from: string; date: string }[] = []
    const batchSize = 20
    for (let i = 0; i < messages.length; i += batchSize) {
      const batch = messages.slice(i, i + batchSize)
      const details = await Promise.all(
        batch.map((msg) =>
          gmail.users.messages.get({
            userId: 'me',
            id: msg.id!,
            format: 'metadata',
            metadataHeaders: ['Subject', 'From', 'Date'],
          }),
        ),
      )

      for (const detail of details) {
        const headers = detail.data.payload?.headers || []
        const subject = headers.find((h) => h.name?.toLowerCase() === 'subject')?.value || ''
        const from = headers.find((h) => h.name?.toLowerCase() === 'from')?.value || ''
        const date = headers.find((h) => h.name?.toLowerCase() === 'date')?.value || ''
        receipts.push({ subject, from, date })
      }

      if (i + batchSize < messages.length) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
    }

    // Send to Claude for subscription detection
    const claude = getClaudeClient()
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), CLAUDE_TIMEOUT)

    let claudeResponse
    try {
      claudeResponse = await claude.messages.create(
        {
          model: CLAUDE_MODEL,
          max_tokens: 1024,
          messages: [
            {
              role: 'user',
              content: `Analyze these receipt/payment emails and identify recurring subscriptions.

Emails (${receipts.length} total):
${receipts.map((r, i) => `${i + 1}. From: ${r.from} | Subject: ${r.subject} | Date: ${r.date}`).join('\n')}

Respond with ONLY a JSON array (no markdown, no explanation):
[
  {
    "serviceName": "Service Name",
    "monthlyCost": 9.99,
    "category": "streaming|software|news|fitness|storage|music|gaming|productivity|other",
    "detectedSince": "YYYY-MM-DD",
    "lastCharge": "YYYY-MM-DD"
  }
]

Only include services that appear to be recurring subscriptions (multiple charges or subscription-related language). Return an empty array if no subscriptions are detected.`,
            },
          ],
        },
        { signal: controller.signal },
      )
    } finally {
      clearTimeout(timeout)
    }

    const rawText =
      claudeResponse.content[0].type === 'text' ? claudeResponse.content[0].text : ''
    const cleanedText = stripCodeFences(rawText)

    let subscriptions: DetectedSubscription[]
    try {
      subscriptions = JSON.parse(cleanedText)
    } catch {
      return error(res, 502, 'Failed to parse Claude response')
    }

    if (!Array.isArray(subscriptions)) {
      return error(res, 502, 'Invalid subscription response format')
    }

    return success(res, subscriptions, {
      receiptsScanned: receipts.length,
      subscriptionsFound: subscriptions.length,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Subscription detection failed'
    if (message.includes('aborted') || message.includes('AbortError')) {
      return error(res, 504, 'Claude API request timed out')
    }
    return error(res, 500, message)
  }
}
