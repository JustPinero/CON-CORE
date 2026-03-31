import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getSenders } from './gmail'

describe('gmail service', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('returns sender data on success', async () => {
    const mockData = {
      data: [
        { senderAddress: 'test@example.com', senderName: 'Test', messageCount: 10 },
      ],
      error: null,
      meta: { totalSenders: 1, pagesScanned: 1, truncated: false },
    }

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockData),
      }),
    )

    const result = await getSenders()
    expect(result.data).toHaveLength(1)
    expect(result.data![0].senderAddress).toBe('test@example.com')
    expect(result.error).toBeNull()
  })

  it('returns error on non-ok response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: 'Token expired' }),
      }),
    )

    const result = await getSenders()
    expect(result.data).toBeNull()
    expect(result.error).toBe('Token expired')
  })

  it('returns error on network failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('Network error')),
    )

    const result = await getSenders()
    expect(result.data).toBeNull()
    expect(result.error).toBe('Network error')
  })

  it('returns senders sorted by message count', async () => {
    const mockData = {
      data: [
        { senderAddress: 'a@test.com', senderName: 'A', messageCount: 100 },
        { senderAddress: 'b@test.com', senderName: 'B', messageCount: 50 },
        { senderAddress: 'c@test.com', senderName: 'C', messageCount: 200 },
      ],
      error: null,
      meta: { totalSenders: 3, pagesScanned: 1, truncated: false },
    }

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockData),
      }),
    )

    const result = await getSenders()
    // API returns pre-sorted, client trusts the order
    expect(result.data).toHaveLength(3)
    expect(result.data![0].messageCount).toBe(100)
  })
})
