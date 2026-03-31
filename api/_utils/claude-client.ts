import Anthropic from '@anthropic-ai/sdk'

let client: Anthropic | null = null

export function getClaudeClient(): Anthropic {
  if (client) return client

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('Missing ANTHROPIC_API_KEY')
  }

  client = new Anthropic({ apiKey })
  return client
}

export function stripCodeFences(text: string): string {
  return text
    .replace(/^```(?:json)?\s*\n?/m, '')
    .replace(/\n?```\s*$/m, '')
    .trim()
}

export const CLAUDE_MODEL = 'claude-sonnet-4-20250514'
export const CLAUDE_TIMEOUT = 15000
