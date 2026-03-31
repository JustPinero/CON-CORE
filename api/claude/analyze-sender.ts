import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleCors } from '../_utils/cors'
import { success, error, methodNotAllowed } from '../_utils/response'
import { validateEnv } from '../_utils/env'
import { getGmailClient } from '../_utils/gmail-client'
import { getClaudeClient, stripCodeFences, CLAUDE_MODEL, CLAUDE_TIMEOUT } from '../_utils/claude-client'

interface CategoryBreakdown {
  promo: number
  transactional: number
  work: number
  personal: number
  newsletter: number
  system: number
}

interface AnalysisResult {
  categoryBreakdown: CategoryBreakdown
  dossier: string
}

const SAMPLE_SIZE = 20

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

    // Fetch sample messages from this sender
    const gmail = await getGmailClient()
    const listRes = await gmail.users.messages.list({
      userId: 'me',
      q: `from:${senderAddress}`,
      maxResults: SAMPLE_SIZE,
    })

    const messages = listRes.data.messages || []
    if (messages.length === 0) {
      return error(res, 404, `No messages found from ${senderAddress}`)
    }

    // Fetch subject lines for analysis
    const subjects: string[] = []
    const batchSize = 10
    for (let i = 0; i < messages.length; i += batchSize) {
      const batch = messages.slice(i, i + batchSize)
      const details = await Promise.all(
        batch.map((msg) =>
          gmail.users.messages.get({
            userId: 'me',
            id: msg.id!,
            format: 'metadata',
            metadataHeaders: ['Subject'],
          }),
        ),
      )
      for (const detail of details) {
        const subjectHeader = detail.data.payload?.headers?.find(
          (h) => h.name?.toLowerCase() === 'subject',
        )
        if (subjectHeader?.value) {
          subjects.push(subjectHeader.value)
        }
      }
    }

    // Send to Claude for analysis
    const claude = getClaudeClient()
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), CLAUDE_TIMEOUT)

    let claudeResponse
    try {
      claudeResponse = await claude.messages.create(
        {
          model: CLAUDE_MODEL,
          max_tokens: 512,
          messages: [
            {
              role: 'user',
              content: `Analyze these ${subjects.length} email subject lines from the sender "${senderAddress}" and categorize them.

Subject lines:
${subjects.map((s, i) => `${i + 1}. ${s}`).join('\n')}

Respond with ONLY a JSON object (no markdown, no explanation) in this exact format:
{
  "categoryBreakdown": {
    "promo": <percentage 0-100>,
    "transactional": <percentage 0-100>,
    "work": <percentage 0-100>,
    "personal": <percentage 0-100>,
    "newsletter": <percentage 0-100>,
    "system": <percentage 0-100>
  },
  "dossier": "<ONE LINE ALL CAPS summary of this sender, e.g. RETAIL ELECTRONICS PROMOTIONS — WEEKLY DEALS>"
}

Categories:
- promo: marketing, deals, sales, promotions, ads
- transactional: receipts, order confirmations, shipping, account updates
- work: professional communication, meetings, projects
- personal: direct personal messages
- newsletter: content digests, updates, news roundups
- system: security alerts, password resets, verification codes

Percentages must sum to 100.`,
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

    let parsed: AnalysisResult
    try {
      parsed = JSON.parse(cleanedText) as AnalysisResult
    } catch {
      return error(res, 502, 'Failed to parse Claude response as JSON')
    }

    // Validate structure
    const breakdown = parsed.categoryBreakdown
    if (
      !breakdown ||
      typeof breakdown.promo !== 'number' ||
      typeof breakdown.transactional !== 'number' ||
      typeof breakdown.work !== 'number' ||
      typeof breakdown.personal !== 'number' ||
      typeof breakdown.newsletter !== 'number' ||
      typeof breakdown.system !== 'number'
    ) {
      return error(res, 502, 'Invalid category breakdown structure from Claude')
    }

    return success(res, {
      senderAddress,
      categoryBreakdown: breakdown,
      dossier: parsed.dossier || 'UNKNOWN SENDER',
      sampledMessages: subjects.length,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Analysis failed'

    if (message.includes('aborted') || message.includes('AbortError')) {
      return error(res, 504, 'Claude API request timed out')
    }

    if (message.includes('invalid_grant') || message.includes('Token has been expired')) {
      return error(res, 401, 'Token expired. Please refresh or re-login.')
    }

    return error(res, 500, message)
  }
}
