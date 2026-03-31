import { describe, it, expect } from 'vitest'
import { sortBySize, sortByDate, detectDuplicateFiles, getStorageSummary, formatSize } from './filerecon'
import type { FileEntry } from './filerecon'

const mockFiles: FileEntry[] = [
  { name: 'doc.pdf', size: 1024000, lastModified: '2026-01-15', type: 'pdf', path: '/docs' },
  { name: 'photo.jpg', size: 5242880, lastModified: '2025-06-01', type: 'jpg', path: '/photos' },
  { name: 'doc.pdf', size: 1024000, lastModified: '2026-02-01', type: 'pdf', path: '/backup' },
  { name: 'notes.txt', size: 512, lastModified: '2024-01-01', type: 'txt', path: '/notes' },
]

describe('filerecon', () => {
  it('sorts by size descending', () => {
    const sorted = sortBySize(mockFiles)
    expect(sorted[0].name).toBe('photo.jpg')
    expect(sorted[sorted.length - 1].name).toBe('notes.txt')
  })

  it('sorts by date ascending (oldest first)', () => {
    const sorted = sortByDate(mockFiles)
    expect(sorted[0].name).toBe('notes.txt')
  })

  it('detects duplicate files by name+size', () => {
    const dupes = detectDuplicateFiles(mockFiles)
    expect(dupes).toHaveLength(1)
    expect(dupes[0]).toHaveLength(2)
    expect(dupes[0][0].name).toBe('doc.pdf')
  })

  it('calculates storage summary', () => {
    const summary = getStorageSummary(mockFiles)
    expect(summary.total).toBe(1024000 + 5242880 + 1024000 + 512)
    expect(summary.byType['pdf']).toBe(2048000)
  })

  it('formats file sizes', () => {
    expect(formatSize(512)).toBe('512 B')
    expect(formatSize(1024)).toBe('1.0 KB')
    expect(formatSize(1048576)).toBe('1.0 MB')
    expect(formatSize(1073741824)).toBe('1.0 GB')
  })
})
