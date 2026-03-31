import type { Subscription } from '../../utils/types'

interface SubscrListProps {
  subscriptions: Subscription[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export default function SubscrList({ subscriptions, selectedId, onSelect }: SubscrListProps) {
  if (subscriptions.length === 0) {
    return (
      <div style={{ color: 'var(--crt-tertiary)', textTransform: 'uppercase', padding: 'var(--space-3)', textAlign: 'center' }}>
        NO SUBSCRIPTIONS DETECTED
      </div>
    )
  }

  return (
    <div style={{ border: '1px solid var(--crt-primary)' }}>
      {subscriptions.map((sub) => (
        <div
          key={sub.id}
          onClick={() => onSelect(sub.id)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onSelect(sub.id)}
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--crt-primary)',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: selectedId === sub.id ? 'var(--crt-primary)' : 'transparent',
            color: selectedId === sub.id ? 'var(--crt-bg)' : 'var(--crt-primary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ textTransform: 'uppercase' }}>{sub.serviceName}</span>
            {sub.usageStatus === 'forgotten' && (
              <span
                style={{
                  fontSize: '10px',
                  padding: '2px 6px',
                  border: '1px solid var(--crt-warning)',
                  color: selectedId === sub.id ? 'var(--crt-bg)' : 'var(--crt-warning)',
                  textTransform: 'uppercase',
                }}
              >
                FORGOTTEN
              </span>
            )}
          </div>
          <span style={{ fontSize: '14px' }}>${sub.monthlyCost.toFixed(2)}/MO</span>
        </div>
      ))}
    </div>
  )
}
