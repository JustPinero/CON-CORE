import { describe, it, expect } from 'vitest'
import { extractUnsubscribeUrl } from './unsubscribe'

describe('extractUnsubscribeUrl', () => {
  it('extracts HTTP URL', () => {
    const header = '<https://example.com/unsubscribe?id=123>'
    expect(extractUnsubscribeUrl(header)).toBe('https://example.com/unsubscribe?id=123')
  })

  it('extracts mailto URL', () => {
    const header = '<mailto:unsubscribe@example.com>'
    expect(extractUnsubscribeUrl(header)).toBe('mailto:unsubscribe@example.com')
  })

  it('prefers HTTP over mailto when both present', () => {
    const header = '<mailto:unsub@example.com>, <https://example.com/unsub>'
    expect(extractUnsubscribeUrl(header)).toBe('https://example.com/unsub')
  })

  it('returns null for empty header', () => {
    expect(extractUnsubscribeUrl('')).toBeNull()
  })

  it('returns null for malformed header', () => {
    expect(extractUnsubscribeUrl('not a valid header')).toBeNull()
  })

  it('handles header with extra whitespace', () => {
    const header = '  <https://example.com/unsub>  '
    expect(extractUnsubscribeUrl(header)).toBe('https://example.com/unsub')
  })
})
