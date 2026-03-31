import { describe, it, expect } from 'vitest'
import { isCacheFresh, CACHE_TTL_DAYS } from './cache'

describe('isCacheFresh', () => {
  it('returns false for null timestamp', () => {
    expect(isCacheFresh(null)).toBe(false)
  })

  it('returns true for recent timestamp', () => {
    const recent = new Date().toISOString()
    expect(isCacheFresh(recent)).toBe(true)
  })

  it('returns true for timestamp within TTL', () => {
    const withinTtl = new Date(Date.now() - (CACHE_TTL_DAYS - 1) * 24 * 60 * 60 * 1000)
    expect(isCacheFresh(withinTtl.toISOString())).toBe(true)
  })

  it('returns false for stale timestamp', () => {
    const stale = new Date(Date.now() - (CACHE_TTL_DAYS + 1) * 24 * 60 * 60 * 1000)
    expect(isCacheFresh(stale.toISOString())).toBe(false)
  })

  it('returns false for very old timestamp', () => {
    expect(isCacheFresh('2020-01-01T00:00:00.000Z')).toBe(false)
  })

  it('has default TTL of 7 days', () => {
    expect(CACHE_TTL_DAYS).toBe(7)
  })
})
