import type { PasswordAuditResult } from '../../utils/types'

interface ThreatReportProps {
  results: PasswordAuditResult[]
  selectedAccount: string | null
  onSelect: (name: string) => void
}

const THREAT_COLORS = {
  red: 'var(--crt-danger)',
  yellow: 'var(--crt-warning)',
  green: 'var(--crt-primary)',
}

export default function ThreatReport({ results, selectedAccount, onSelect }: ThreatReportProps) {
  const sorted = [...results].sort((a, b) => {
    const order = { red: 0, yellow: 1, green: 2 }
    return order[a.threatLevel] - order[b.threatLevel]
  })

  const redCount = results.filter((r) => r.threatLevel === 'red').length
  const yellowCount = results.filter((r) => r.threatLevel === 'yellow').length
  const greenCount = results.filter((r) => r.threatLevel === 'green').length

  const selected = results.find((r) => r.accountName === selectedAccount)

  return (
    <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '11px', color: 'var(--crt-tertiary)', marginBottom: '8px', textTransform: 'uppercase', display: 'flex', gap: '16px' }}>
          <span style={{ color: THREAT_COLORS.red }}>{redCount} RED</span>
          <span style={{ color: THREAT_COLORS.yellow }}>{yellowCount} YELLOW</span>
          <span style={{ color: THREAT_COLORS.green }}>{greenCount} GREEN</span>
        </div>

        <div style={{ border: '1px solid var(--crt-primary)', maxHeight: 'calc(100vh - 250px)', overflowY: 'auto' }}>
          {sorted.map((result) => (
            <div
              key={result.accountName}
              onClick={() => onSelect(result.accountName)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onSelect(result.accountName)}
              style={{
                padding: '10px 16px',
                borderBottom: '1px solid var(--crt-primary)',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: selectedAccount === result.accountName ? 'var(--crt-bg-light)' : 'transparent',
              }}
            >
              <span style={{ textTransform: 'uppercase' }}>{result.accountName}</span>
              <span style={{ color: THREAT_COLORS[result.threatLevel], fontSize: '12px', fontWeight: 'normal' }}>
                [{result.threatLevel.toUpperCase()}]
              </span>
            </div>
          ))}
        </div>
      </div>

      {selected && (
        <div style={{ width: '300px', border: '1px solid var(--crt-primary)', padding: 'var(--space-2)' }}>
          <div style={{ textTransform: 'uppercase', fontSize: '14px', marginBottom: '8px', color: THREAT_COLORS[selected.threatLevel] }} className="glow">
            {selected.accountName}
          </div>
          <div style={{ fontSize: '12px', marginBottom: '12px' }}>
            THREAT: <span style={{ color: THREAT_COLORS[selected.threatLevel] }}>{selected.threatLevel.toUpperCase()}</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--crt-secondary)', marginBottom: '12px' }}>
            <div style={{ textTransform: 'uppercase', marginBottom: '4px' }}>ISSUES:</div>
            {selected.issues.map((issue, i) => (
              <div key={i} style={{ paddingLeft: '8px', marginBottom: '2px' }}>- {issue}</div>
            ))}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--crt-primary)', borderTop: '1px solid var(--crt-primary)', paddingTop: '8px' }}>
            {selected.recommendation}
          </div>
        </div>
      )}
    </div>
  )
}
