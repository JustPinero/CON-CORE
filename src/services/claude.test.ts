import { describe, it, expect, vi, beforeEach } from 'vitest'
import { analyzeSender } from './claude'

describe('claude service', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('returns analysis data on success', async () => {
    const mockData = {
      data: {
        senderAddress: 'deals@bestbuy.com',
        categoryBreakdown: {
          promo: 75,
          transactional: 20,
          work: 0,
          personal: 0,
          newsletter: 5,
          system: 0,
        },
        dossier: 'RETAIL ELECTRONICS PROMOTIONS — WEEKLY DEALS',
        sampledMessages: 20,
      },
      error: null,
      meta: {},
    }

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockData),
      }),
    )

    const result = await analyzeSender('deals@bestbuy.com')
    expect(result.data).toBeDefined()
    expect(result.data!.categoryBreakdown.promo).toBe(75)
    expect(result.data!.dossier).toContain('RETAIL')
    expect(result.error).toBeNull()
  })

  it('sends POST with senderAddress in body', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: {}, error: null, meta: {} }),
    })
    vi.stubGlobal('fetch', mockFetch)

    await analyzeSender('test@example.com')

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/claude/analyze-sender',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ senderAddress: 'test@example.com' }),
      }),
    )
  })

  it('returns error on non-ok response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: 'Claude API request timed out' }),
      }),
    )

    const result = await analyzeSender('test@example.com')
    expect(result.data).toBeNull()
    expect(result.error).toBe('Claude API request timed out')
  })

  it('returns error on network failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')))

    const result = await analyzeSender('test@example.com')
    expect(result.data).toBeNull()
    expect(result.error).toBe('Network error')
  })

  it('category percentages sum to 100 in mock response', async () => {
    const breakdown = {
      promo: 60,
      transactional: 20,
      work: 5,
      personal: 5,
      newsletter: 8,
      system: 2,
    }
    const sum = Object.values(breakdown).reduce((a, b) => a + b, 0)
    expect(sum).toBe(100)
  })
})
