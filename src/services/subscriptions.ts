import type { ApiResponse, Subscription } from '../utils/types'

const REQUEST_TIMEOUT = 30000

export async function detectSubscriptions(): Promise<ApiResponse<Subscription[]>> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

  try {
    const res = await fetch('/api/claude/detect-subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
      signal: controller.signal,
    })
    clearTimeout(timeout)
    const json = await res.json()

    if (!res.ok) return { data: null, error: json.error || 'Detection failed', meta: {} }

    // Map API response to our Subscription type
    const subs: Subscription[] = (json.data || []).map((s: Record<string, unknown>, i: number) => ({
      id: `sub-${i}`,
      serviceName: s.serviceName as string,
      monthlyCost: s.monthlyCost as number,
      category: s.category as string,
      detectedSince: s.detectedSince as string,
      lastCharge: s.lastCharge as string,
      lifetimeSpend: 0,
      usageStatus: 'active' as const,
      cancellationUrl: null,
    }))

    return { data: subs, error: null, meta: json.meta || {} }
  } catch (err) {
    clearTimeout(timeout)
    if (err instanceof DOMException && err.name === 'AbortError') {
      return { data: null, error: 'Request timed out', meta: {} }
    }
    return { data: null, error: 'Network error', meta: {} }
  }
}

export function calculateMonthlyTotal(subs: Subscription[]): number {
  return subs.reduce((sum, s) => sum + s.monthlyCost, 0)
}

export function calculateAnnualProjection(monthlyTotal: number): number {
  return monthlyTotal * 12
}
