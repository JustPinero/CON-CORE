interface ErrorDisplayProps {
  code?: string
  message: string
}

export default function ErrorDisplay({ code = 'ERR', message }: ErrorDisplayProps) {
  return (
    <div
      style={{
        border: '2px solid var(--crt-danger)',
        padding: 'var(--space-2)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <div style={{ color: 'var(--crt-danger)', textTransform: 'uppercase', fontSize: '14px', letterSpacing: '0.1em' }}>
        SYSTEM ERROR [{code}]
      </div>
      <div style={{ color: 'var(--crt-danger)', fontSize: '12px' }}>
        {message}
      </div>
    </div>
  )
}
