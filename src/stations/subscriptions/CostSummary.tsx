interface CostSummaryProps {
  monthlyTotal: number
  annualProjection: number
  subscriptionCount: number
  forgottenCount: number
}

export default function CostSummary({
  monthlyTotal,
  annualProjection,
  subscriptionCount,
  forgottenCount,
}: CostSummaryProps) {
  return (
    <div
      style={{
        border: '2px solid var(--crt-primary)',
        padding: 'var(--space-2)',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 'var(--space-2)',
        marginBottom: 'var(--space-3)',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '11px', color: 'var(--crt-tertiary)', textTransform: 'uppercase' }}>
          MONTHLY
        </div>
        <div style={{ fontSize: '20px' }} className="glow">
          ${monthlyTotal.toFixed(2)}
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '11px', color: 'var(--crt-tertiary)', textTransform: 'uppercase' }}>
          ANNUAL
        </div>
        <div style={{ fontSize: '20px' }} className="glow">
          ${annualProjection.toFixed(2)}
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '11px', color: 'var(--crt-tertiary)', textTransform: 'uppercase' }}>
          SERVICES
        </div>
        <div style={{ fontSize: '20px' }}>{subscriptionCount}</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '11px', color: 'var(--crt-tertiary)', textTransform: 'uppercase' }}>
          FORGOTTEN
        </div>
        <div style={{ fontSize: '20px', color: forgottenCount > 0 ? 'var(--crt-warning)' : 'var(--crt-primary)' }}>
          {forgottenCount}
        </div>
      </div>
    </div>
  )
}
