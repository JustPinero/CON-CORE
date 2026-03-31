import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleCors } from '../_utils/cors'
import { success, error, methodNotAllowed } from '../_utils/response'
import { validateEnv } from '../_utils/env'
import { getClaudeClient, stripCodeFences, CLAUDE_MODEL, CLAUDE_TIMEOUT } from '../_utils/claude-client'

interface BookmarkInput {
  url: string
  title: string
}

interface CategorizedResult {
  url: string
  title: string
  vault: string
}

const CHUNK_SIZE = 100

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return

  if (req.method !== 'POST') {
    return methodNotAllowed(res, ['POST'])
  }

  try {
    validateEnv()

    const { bookmarks } = req.body || {}
    if (!Array.isArray(bookmarks) || bookmarks.length === 0) {
      return error(res, 400, 'Missing required field: bookmarks (array)')
    }

    const claude = getClaudeClient()
    const allResults: CategorizedResult[] = []

    // Process in chunks to avoid token limits
    for (let i = 0; i < bookmarks.length; i += CHUNK_SIZE) {
      const chunk = bookmarks.slice(i, i + CHUNK_SIZE) as BookmarkInput[]

      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), CLAUDE_TIMEOUT)

      let claudeResponse
      try {
        claudeResponse = await claude.messages.create(
          {
            model: CLAUDE_MODEL,
            max_tokens: 2048,
            messages: [
              {
                role: 'user',
                content: `Categorize these ${chunk.length} bookmarks into vault categories based on their URLs and titles.

Bookmarks:
${chunk.map((b, j) => `${j + 1}. ${b.title} — ${b.url}`).join('\n')}

Respond with ONLY a JSON array (no markdown, no explanation):
[
  { "url": "...", "title": "...", "vault": "CATEGORY NAME" }
]

Use short, descriptive ALL-CAPS vault names like: DEVELOPMENT, DESIGN, NEWS, SHOPPING, SOCIAL, ENTERTAINMENT, REFERENCE, FINANCE, HEALTH, TOOLS, EDUCATION, GAMING, WORK, MISC.
Every bookmark must be assigned to exactly one vault.`,
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

      try {
        const parsed = JSON.parse(cleanedText) as CategorizedResult[]
        if (Array.isArray(parsed)) {
          allResults.push(...parsed)
        }
      } catch {
        // If a chunk fails to parse, assign all to MISC
        allResults.push(...chunk.map((b) => ({ ...b, vault: 'MISC' })))
      }
    }

    // Group into vaults
    const vaultMap = new Map<string, CategorizedResult[]>()
    for (const result of allResults) {
      const vault = result.vault || 'MISC'
      const existing = vaultMap.get(vault) || []
      existing.push(result)
      vaultMap.set(vault, existing)
    }

    const vaults = Array.from(vaultMap.entries()).map(([name, bookmarks]) => ({
      name,
      bookmarks: bookmarks.map((b, i) => ({
        id: `bm-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}-${i}`,
        url: b.url,
        title: b.title,
        vault: name,
        status: 'alive' as const,
        dupeCount: 0,
      })),
    }))

    return success(res, vaults, {
      totalBookmarks: allResults.length,
      vaultCount: vaults.length,
      chunksProcessed: Math.ceil(bookmarks.length / CHUNK_SIZE),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Categorization failed'
    if (message.includes('aborted') || message.includes('AbortError')) {
      return error(res, 504, 'Claude API request timed out')
    }
    return error(res, 500, message)
  }
}
