import { describe, it, expect, beforeEach } from 'vitest'
import { isAuthenticated, setAuthenticated } from './auth'

describe('auth service', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('returns false when not authenticated', () => {
    expect(isAuthenticated()).toBe(false)
  })

  it('returns true after setAuthenticated(true)', () => {
    setAuthenticated(true)
    expect(isAuthenticated()).toBe(true)
  })

  it('returns false after setAuthenticated(false)', () => {
    setAuthenticated(true)
    setAuthenticated(false)
    expect(isAuthenticated()).toBe(false)
  })
})
