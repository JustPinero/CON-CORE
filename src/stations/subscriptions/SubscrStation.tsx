import { useState, useEffect } from 'react'
import Shell from '../../components/Shell'
import CostSummary from './CostSummary'
import SubscrList from './SubscrList'
import { detectSubscriptions, calculateMonthlyTotal, calculateAnnualProjection } from '../../services/subscriptions'
import type { Subscription } from '../../utils/types'

export default function SubscrStation() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusMessage, setStatusMessage] = useState('SCANNING FOR SUBSCRIPTIONS...')

  useEffect(() => {
    async function load() {
      const result = await detectSubscriptions()
      if (result.data) {
        setSubscriptions(result.data)
        setStatusMessage(`${result.data.length} SUBSCRIPTIONS DETECTED`)
      } else {
        setStatusMessage(`ERROR: ${result.error}`)
      }
      setLoading(false)
    }
    load()
  }, [])

  const selected = subscriptions.find((s) => s.id === selectedId)
  const monthlyTotal = calculateMonthlyTotal(subscriptions)
  const annualProjection = calculateAnnualProjection(monthlyTotal)
  const forgottenCount = subscriptions.filter((s) => s.usageStatus === 'forgotten').length

  return (
    <Shell stationName="SUBSCRIPTIONS" statusMessage={statusMessage} statusVariant={loading ? 'processing' : 'ready'}>
      <CostSummary
        monthlyTotal={monthlyTotal}
        annualProjection={annualProjection}
        subscriptionCount={subscriptions.length}
        forgottenCount={forgottenCount}
      />

      <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
        <div style={{ flex: 1 }}>
          <SubscrList
            subscriptions={subscriptions}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>

        {selected && (
          <div style={{ width: '300px', border: '1px solid var(--crt-primary)', padding: 'var(--space-2)' }}>
            <div style={{ textTransform: 'uppercase', fontSize: '16px', marginBottom: '8px' }} className="glow">
              {selected.serviceName}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--crt-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div>CATEGORY: {selected.category.toUpperCase()}</div>
              <div>MONTHLY: ${selected.monthlyCost.toFixed(2)}</div>
              <div>FIRST DETECTED: {selected.detectedSince}</div>
              <div>LAST CHARGE: {selected.lastCharge}</div>
              <div>STATUS: <span style={{ color: selected.usageStatus === 'forgotten' ? 'var(--crt-warning)' : 'var(--crt-primary)' }}>
                {selected.usageStatus.toUpperCase()}
              </span></div>
            </div>
          </div>
        )}
      </div>
    </Shell>
  )
}
