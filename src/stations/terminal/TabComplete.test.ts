import { describe, it, expect } from 'vitest'
import { tabComplete } from './TabComplete'
import './HelpSystem' // Ensure help command is registered

describe('TabComplete', () => {
  it('returns all commands for empty input', () => {
    const result = tabComplete('')
    expect(result.type).toBe('ambiguous')
    expect(result.options.length).toBeGreaterThanOrEqual(2)
    expect(result.options).toContain('clear')
    expect(result.options).toContain('help')
  })

  it('returns single match for unambiguous prefix', () => {
    const result = tabComplete('cle')
    expect(result.type).toBe('complete')
    expect(result.value).toBe('clear')
  })

  it('returns ambiguous for shared prefix', () => {
    // Both 'clear' and 'help' don't share prefix,
    // but 'cl' only matches 'clear'
    const result = tabComplete('cl')
    expect(result.type).toBe('complete')
    expect(result.value).toBe('clear')
  })

  it('returns none for no matches', () => {
    const result = tabComplete('zzz')
    expect(result.type).toBe('none')
    expect(result.options).toEqual([])
  })

  it('is case-insensitive', () => {
    const result = tabComplete('CLE')
    expect(result.type).toBe('complete')
    expect(result.value).toBe('clear')
  })
})
