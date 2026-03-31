import type { ApiResponse } from '../utils/types'

const REQUEST_TIMEOUT = 30000

interface SenderEntry {
  senderAddress: string
  senderName: string
  messageCount: number
}

interface SendersMeta {
  totalSenders: number
  pagesScanned: number
  truncated: boolean
}

export async function getSenders(): Promise<ApiResponse<SenderEntry[]>> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

  try {
    const res = await fetch('/api/gmail/senders', { signal: controller.signal })
    clearTimeout(timeout)

    const json = await res.json()

    if (!res.ok) {
      return { data: null, error: json.error || 'Failed to fetch senders', meta: {} }
    }

    return json as ApiResponse<SenderEntry[]> & { meta: SendersMeta }
  } catch (err) {
    clearTimeout(timeout)
    if (err instanceof DOMException && err.name === 'AbortError') {
      return { data: null, error: 'Request timed out', meta: {} }
    }
    return { data: null, error: 'Network error', meta: {} }
  }
}

export async function batchDelete(senderAddress: string): Promise<ApiResponse<{ deleted: number }>> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 60000)

  try {
    const res = await fetch('/api/gmail/batch-delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senderAddress }),
      signal: controller.signal,
    })
    clearTimeout(timeout)
    const json = await res.json()
    if (!res.ok) return { data: null, error: json.error || 'Delete failed', meta: {} }
    return json
  } catch (err) {
    clearTimeout(timeout)
    if (err instanceof DOMException && err.name === 'AbortError') {
      return { data: null, error: 'Request timed out', meta: {} }
    }
    return { data: null, error: 'Network error', meta: {} }
  }
}

export async function batchArchive(senderAddress: string): Promise<ApiResponse<{ archived: number }>> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 60000)

  try {
    const res = await fetch('/api/gmail/batch-archive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senderAddress }),
      signal: controller.signal,
    })
    clearTimeout(timeout)
    const json = await res.json()
    if (!res.ok) return { data: null, error: json.error || 'Archive failed', meta: {} }
    return json
  } catch (err) {
    clearTimeout(timeout)
    if (err instanceof DOMException && err.name === 'AbortError') {
      return { data: null, error: 'Request timed out', meta: {} }
    }
    return { data: null, error: 'Network error', meta: {} }
  }
}

export type { SenderEntry, SendersMeta }
