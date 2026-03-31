import { describe, it, expect } from 'vitest'
import { parseChromeBookmarks, normalizeUrl, detectDuplicates, type CategorizedBookmark } from './bookmarks'

describe('parseChromeBookmarks', () => {
  it('extracts bookmarks from Chrome JSON format', () => {
    const json = JSON.stringify({
      roots: {
        bookmark_bar: {
          name: 'Bookmarks Bar',
          type: 'folder',
          children: [
            { type: 'url', name: 'Google', url: 'https://google.com' },
            {
              type: 'folder',
              name: 'Dev',
              children: [
                { type: 'url', name: 'GitHub', url: 'https://github.com' },
              ],
            },
          ],
        },
      },
    })

    const result = parseChromeBookmarks(json)
    expect(result).toHaveLength(2)
    expect(result[0].title).toBe('Google')
    expect(result[0].url).toBe('https://google.com')
    expect(result[1].title).toBe('GitHub')
    expect(result[1].folderPath).toContain('Dev')
  })

  it('handles empty bookmark file', () => {
    const json = JSON.stringify({ roots: {} })
    expect(parseChromeBookmarks(json)).toHaveLength(0)
  })

  it('throws on malformed JSON', () => {
    expect(() => parseChromeBookmarks('not json')).toThrow()
  })
})

describe('normalizeUrl', () => {
  it('strips www prefix', () => {
    expect(normalizeUrl('https://www.example.com/page')).toBe('example.com/page')
  })

  it('strips trailing slashes', () => {
    expect(normalizeUrl('https://example.com/page/')).toBe('example.com/page')
  })

  it('lowercases everything for dedup comparison', () => {
    expect(normalizeUrl('https://EXAMPLE.COM/Page')).toBe('example.com/page')
  })

  it('handles invalid URL gracefully', () => {
    expect(normalizeUrl('not-a-url')).toBe('not-a-url')
  })
})

describe('detectDuplicates', () => {
  const bookmarks: CategorizedBookmark[] = [
    { id: '1', url: 'https://example.com', title: 'A', vault: 'v1', status: 'alive', dupeCount: 0 },
    { id: '2', url: 'https://www.example.com/', title: 'B', vault: 'v2', status: 'alive', dupeCount: 0 },
    { id: '3', url: 'https://unique.com', title: 'C', vault: 'v1', status: 'alive', dupeCount: 0 },
  ]

  it('detects duplicates with URL normalization', () => {
    const result = detectDuplicates(bookmarks)
    const dupes = result.filter((b) => b.status === 'dupe')
    expect(dupes).toHaveLength(2)
    expect(dupes[0].dupeCount).toBe(2)
  })

  it('does not flag unique URLs', () => {
    const result = detectDuplicates(bookmarks)
    const unique = result.find((b) => b.id === '3')
    expect(unique?.status).toBe('alive')
    expect(unique?.dupeCount).toBe(0)
  })
})
