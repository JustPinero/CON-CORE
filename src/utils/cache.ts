const CACHE_TTL_DAYS = 7

export function isCacheFresh(lastAnalyzed: string | null): boolean {
  if (!lastAnalyzed) return false
  const analyzed = new Date(lastAnalyzed)
  const now = new Date()
  const diffMs = now.getTime() - analyzed.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  return diffDays < CACHE_TTL_DAYS
}

export { CACHE_TTL_DAYS }
