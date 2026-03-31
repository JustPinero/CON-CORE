import { describe, it, expect } from 'vitest'
import { calculateMonthlyTotal, calculateAnnualProjection } from './subscriptions'
import type { Subscription } from '../utils/types'

const mockSubs: Subscription[] = [
  { id: '1', serviceName: 'Netflix', monthlyCost: 15.99, category: 'streaming', detectedSince: '2025-01-01', lastCharge: '2026-03-01', lifetimeSpend: 0, usageStatus: 'active', cancellationUrl: null },
  { id: '2', serviceName: 'Spotify', monthlyCost: 9.99, category: 'music', detectedSince: '2024-06-01', lastCharge: '2026-03-15', lifetimeSpend: 0, usageStatus: 'active', cancellationUrl: null },
  { id: '3', serviceName: 'iCloud', monthlyCost: 2.99, category: 'storage', detectedSince: '2023-01-01', lastCharge: '2026-03-01', lifetimeSpend: 0, usageStatus: 'forgotten', cancellationUrl: null },
]

describe('subscription calculations', () => {
  it('calculates monthly total', () => {
    const total = calculateMonthlyTotal(mockSubs)
    expect(total).toBeCloseTo(28.97)
  })

  it('calculates annual projection', () => {
    const annual = calculateAnnualProjection(28.97)
    expect(annual).toBeCloseTo(347.64)
  })

  it('returns 0 for empty subscriptions', () => {
    expect(calculateMonthlyTotal([])).toBe(0)
  })
})
