import type { ApiResponse, CategoryBreakdown } from '../utils/types'

const REQUEST_TIMEOUT = 20000

interface AnalysisResponse {
  senderAddress: string
  categoryBreakdown: CategoryBreakdown
  dossier: string
  sampledMessages: number
}

export async function analyzeSender(
  senderAddress: string,
  senderName?: string,
): Promise<ApiResponse<AnalysisResponse>> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

  try {
    const res = await fetch('/api/claude/analyze-sender', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senderAddress, senderName }),
      signal: controller.signal,
    })
    clearTimeout(timeout)

    const json = await res.json()

    if (!res.ok) {
      return { data: null, error: json.error || 'Analysis failed', meta: {} }
    }

    return json as ApiResponse<AnalysisResponse>
  } catch (err) {
    clearTimeout(timeout)
    if (err instanceof DOMException && err.name === 'AbortError') {
      return { data: null, error: 'Analysis request timed out', meta: {} }
    }
    return { data: null, error: 'Network error', meta: {} }
  }
}

export type { AnalysisResponse }
