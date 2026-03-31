import { describe, it, expect } from 'vitest'
import { parseSender } from './email'

describe('parseSender', () => {
  it('parses "Name <email>" format', () => {
    const result = parseSender('John Doe <john@example.com>')
    expect(result.name).toBe('John Doe')
    expect(result.address).toBe('john@example.com')
  })

  it('parses quoted name format', () => {
    const result = parseSender('"Best Buy" <deals@bestbuy.com>')
    expect(result.name).toBe('Best Buy')
    expect(result.address).toBe('deals@bestbuy.com')
  })

  it('parses bare email address', () => {
    const result = parseSender('noreply@github.com')
    expect(result.name).toBe('noreply@github.com')
    expect(result.address).toBe('noreply@github.com')
  })

  it('parses email in angle brackets only', () => {
    const result = parseSender('<support@stripe.com>')
    expect(result.name).toBe('support@stripe.com')
    expect(result.address).toBe('support@stripe.com')
  })

  it('lowercases email address', () => {
    const result = parseSender('Admin <Admin@EXAMPLE.COM>')
    expect(result.address).toBe('admin@example.com')
  })

  it('handles name with special characters', () => {
    const result = parseSender('"O\'Brien, Tim" <tim@example.com>')
    expect(result.name).toBe("O'Brien, Tim")
    expect(result.address).toBe('tim@example.com')
  })
})
