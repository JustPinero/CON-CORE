export interface FileEntry {
  name: string
  size: number
  lastModified: string
  type: string
  path: string
}

export function sortBySize(files: FileEntry[]): FileEntry[] {
  return [...files].sort((a, b) => b.size - a.size)
}

export function sortByDate(files: FileEntry[]): FileEntry[] {
  return [...files].sort((a, b) => new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime())
}

export function detectDuplicateFiles(files: FileEntry[]): FileEntry[][] {
  const groups = new Map<string, FileEntry[]>()
  for (const file of files) {
    const key = `${file.name}-${file.size}`
    const group = groups.get(key) || []
    group.push(file)
    groups.set(key, group)
  }
  return Array.from(groups.values()).filter(g => g.length > 1)
}

export function getStorageSummary(files: FileEntry[]): { total: number, byType: Record<string, number> } {
  const byType: Record<string, number> = {}
  let total = 0
  for (const file of files) {
    total += file.size
    const ext = file.name.split('.').pop()?.toLowerCase() || 'unknown'
    byType[ext] = (byType[ext] || 0) + file.size
  }
  return { total, byType }
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}
