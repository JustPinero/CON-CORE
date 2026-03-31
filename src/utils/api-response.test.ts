import { describe, it, expect } from 'vitest'

interface ApiResponse<T> {
  data: T | null
  error: string | null
  meta: Record<string, unknown>
}

function makeSuccess<T>(data: T, meta: Record<string, unknown> = {}): ApiResponse<T> {
  return { data, error: null, meta }
}

function makeError(message: string): ApiResponse<null> {
  return { data: null, error: message, meta: {} }
}

describe('API response shape', () => {
  it('produces correct success shape', () => {
    const res = makeSuccess({ status: 'ok' }, { timestamp: '2026-01-01' })
    expect(res.data).toEqual({ status: 'ok' })
    expect(res.error).toBeNull()
    expect(res.meta).toEqual({ timestamp: '2026-01-01' })
  })

  it('produces correct error shape', () => {
    const res = makeError('Not found')
    expect(res.data).toBeNull()
    expect(res.error).toBe('Not found')
    expect(res.meta).toEqual({})
  })
})
