interface StatusBarProps {
  message?: string
  variant?: 'ready' | 'processing' | 'error'
}

export default function StatusBar({ message = 'READY', variant = 'ready' }: StatusBarProps) {
  const colorMap = {
    ready: 'var(--crt-primary)',
    processing: 'var(--crt-warning)',
    error: 'var(--crt-danger)',
  }

  return (
    <footer
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '32px',
        borderTop: '1px solid var(--crt-primary)',
        background: 'var(--crt-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--space-4)',
        zIndex: 100,
      }}
    >
      <span style={{ color: colorMap[variant], fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {message}
      </span>
    </footer>
  )
}
