import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getEvents, batchCreateEvents } from './calendar'

describe('calendar service', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('getEvents returns events on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            data: [
              { id: '1', summary: 'Meeting', start: '2026-04-01T09:00:00Z', end: '2026-04-01T10:00:00Z', calendarId: 'primary' },
            ],
            error: null,
            meta: { count: 1 },
          }),
      }),
    )

    const result = await getEvents('2026-04-01T00:00:00Z', '2026-04-02T00:00:00Z')
    expect(result.data).toHaveLength(1)
    expect(result.data![0].summary).toBe('Meeting')
  })

  it('getEvents passes query params correctly', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [], error: null, meta: {} }),
    })
    vi.stubGlobal('fetch', mockFetch)

    await getEvents('2026-04-01T00:00:00Z', '2026-04-02T00:00:00Z', 'work')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('timeMin='),
      expect.any(Object),
    )
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('calendarId=work'),
      expect.any(Object),
    )
  })

  it('getEvents returns error on failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: 'Token expired' }),
      }),
    )

    const result = await getEvents('2026-04-01T00:00:00Z', '2026-04-02T00:00:00Z')
    expect(result.data).toBeNull()
    expect(result.error).toBe('Token expired')
  })

  it('batchCreateEvents returns created count', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: { created: 5, failed: 0, total: 5 }, error: null, meta: {} }),
      }),
    )

    const result = await batchCreateEvents([
      { summary: 'Test', start: '2026-04-01T09:00:00Z', end: '2026-04-01T10:00:00Z' },
    ])
    expect(result.data!.created).toBe(5)
  })

  it('batchCreateEvents returns error on network failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('fail')))
    const result = await batchCreateEvents([])
    expect(result.data).toBeNull()
    expect(result.error).toBe('Network error')
  })
})
