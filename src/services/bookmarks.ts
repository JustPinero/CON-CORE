import type { ApiResponse } from '../utils/types'

export interface ParsedBookmark {
  url: string
  title: string
  folderPath: string
}

export interface CategorizedBookmark {
  id: string
  url: string
  title: string
  vault: string
  status: 'alive' | 'dead' | 'dupe'
  dupeCount: number
}

export interface BookmarkVault {
  name: string
  bookmarks: CategorizedBookmark[]
}

export function parseChromeBookmarks(jsonString: string): ParsedBookmark[] {
  const data = JSON.parse(jsonString)
  const bookmarks: ParsedBookmark[] = []

  function traverse(node: Record<string, unknown>, path: string) {
    if (node.type === 'url' && typeof node.url === 'string') {
      bookmarks.push({
        url: node.url as string,
        title: (node.name as string) || '',
        folderPath: path,
      })
    }
    if (node.children && Array.isArray(node.children)) {
      const folderName = (node.name as string) || ''
      const newPath = path ? `${path}/${folderName}` : folderName
      for (const child of node.children) {
        traverse(child as Record<string, unknown>, newPath)
      }
    }
  }

  // Chrome bookmarks JSON has a "roots" object with bookmark_bar, other, synced
  const roots = data.roots || data
  if (typeof roots === 'object') {
    for (const key of Object.keys(roots)) {
      const root = roots[key]
      if (root && typeof root === 'object') {
        traverse(root as Record<string, unknown>, '')
      }
    }
  }

  return bookmarks
}

export async function categorizeBookmarks(
  bookmarks: ParsedBookmark[],
): Promise<ApiResponse<BookmarkVault[]>> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 60000)

  try {
    const res = await fetch('/api/claude/categorize-bookmarks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookmarks }),
      signal: controller.signal,
    })
    clearTimeout(timeout)
    const json = await res.json()
    if (!res.ok) return { data: null, error: json.error || 'Categorization failed', meta: {} }
    return json
  } catch (err) {
    clearTimeout(timeout)
    if (err instanceof DOMException && err.name === 'AbortError') {
      return { data: null, error: 'Request timed out', meta: {} }
    }
    return { data: null, error: 'Network error', meta: {} }
  }
}

export function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.replace(/^www\./, '')
    const path = parsed.pathname.replace(/\/+$/, '')
    return `${host}${path}`.toLowerCase()
  } catch {
    return url.toLowerCase()
  }
}

export function detectDuplicates(bookmarks: CategorizedBookmark[]): CategorizedBookmark[] {
  const urlMap = new Map<string, CategorizedBookmark[]>()

  for (const bm of bookmarks) {
    const normalized = normalizeUrl(bm.url)
    const existing = urlMap.get(normalized) || []
    existing.push(bm)
    urlMap.set(normalized, existing)
  }

  return bookmarks.map((bm) => {
    const normalized = normalizeUrl(bm.url)
    const group = urlMap.get(normalized) || []
    if (group.length > 1) {
      return { ...bm, status: 'dupe' as const, dupeCount: group.length }
    }
    return bm
  })
}
