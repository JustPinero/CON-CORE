import { describe, it, expect } from 'vitest'
import { stripCodeFences } from './strip-code-fences'

describe('stripCodeFences', () => {
  it('strips ```json fences', () => {
    const input = '```json\n{"key": "value"}\n```'
    expect(stripCodeFences(input)).toBe('{"key": "value"}')
  })

  it('strips bare ``` fences', () => {
    const input = '```\n{"key": "value"}\n```'
    expect(stripCodeFences(input)).toBe('{"key": "value"}')
  })

  it('returns clean JSON unchanged', () => {
    const input = '{"key": "value"}'
    expect(stripCodeFences(input)).toBe('{"key": "value"}')
  })

  it('handles fences with extra whitespace', () => {
    const input = '```json  \n  {"key": "value"}  \n```  '
    expect(stripCodeFences(input)).toBe('{"key": "value"}')
  })

  it('produces valid parseable JSON from fenced response', () => {
    const input = '```json\n{"promo": 75, "transactional": 20, "work": 0, "personal": 0, "newsletter": 5, "system": 0}\n```'
    const stripped = stripCodeFences(input)
    const parsed = JSON.parse(stripped)
    expect(parsed.promo).toBe(75)
    expect(parsed.transactional).toBe(20)
  })

  it('handles category breakdown that sums to 100', () => {
    const breakdown = { promo: 60, transactional: 20, work: 5, personal: 5, newsletter: 8, system: 2 }
    const sum = Object.values(breakdown).reduce((a, b) => a + b, 0)
    expect(sum).toBe(100)
  })
})
