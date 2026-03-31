import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleCors } from '../_utils/cors'
import { success, error, methodNotAllowed } from '../_utils/response'
import { validateEnv } from '../_utils/env'
import { getClaudeClient, stripCodeFences, CLAUDE_MODEL, CLAUDE_TIMEOUT } from '../_utils/claude-client'

// SECURITY: This route never caches or persists password data

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return

  if (req.method !== 'POST') {
    return methodNotAllowed(res, ['POST'])
  }

  try {
    validateEnv()

    const { records } = req.body || {}
    if (!Array.isArray(records) || records.length === 0) {
      return error(res, 400, 'Missing required field: records (array)')
    }

    const claude = getClaudeClient()
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), CLAUDE_TIMEOUT)

    // Send only account names and passwords (no URLs or usernames for privacy)
    // Actually we need passwords to check for reuse and weakness
    const sanitizedRecords = records.map((r: { accountName: string; password: string }) => ({
      account: r.accountName,
      password: r.password,
    }))

    let claudeResponse
    try {
      claudeResponse = await claude.messages.create(
        {
          model: CLAUDE_MODEL,
          max_tokens: 2048,
          messages: [
            {
              role: 'user',
              content: `Analyze these ${sanitizedRecords.length} account passwords for security issues.

Accounts:
${sanitizedRecords.map((r, i) => `${i + 1}. ${r.account}: "${r.password}"`).join('\n')}

Respond with ONLY a JSON array (no markdown):
[
  {
    "accountName": "account name",
    "threatLevel": "green|yellow|red",
    "issues": ["list of specific issues"],
    "recommendation": "one-line recommendation"
  }
]

Scoring:
- RED: reused password (same as another account), very short (<8 chars), common/dictionary word
- YELLOW: moderate length but no special chars, similar to another password, old/unused service
- GREEN: unique, strong, no issues

Check for: reused passwords across accounts, weak passwords, common patterns (123456, password, etc).`,
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

    let results
    try {
      results = JSON.parse(cleanedText)
    } catch {
      return error(res, 502, 'Failed to parse audit response')
    }

    if (!Array.isArray(results)) {
      return error(res, 502, 'Invalid audit response format')
    }

    // SECURITY: No Supabase writes — response is ephemeral only
    return success(res, results, { audited: records.length })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Password audit failed'
    if (message.includes('aborted') || message.includes('AbortError')) {
      return error(res, 504, 'Claude API request timed out')
    }
    return error(res, 500, message)
  }
}
