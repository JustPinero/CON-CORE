export default function LoadingFallback() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--crt-bg)',
        gap: '16px',
      }}
    >
      <div style={{ color: 'var(--crt-warning)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        LOADING MODULE...
      </div>
      <div style={{ fontFamily: "'Courier New', Courier, monospace", fontSize: '14px' }}>
        <span style={{ color: 'var(--crt-primary)' }}>{'[████████░░░░░░░░░░░░]'}</span>
        <span style={{ color: 'var(--crt-tertiary)', marginLeft: '8px' }}>40%</span>
      </div>
    </div>
  )
}
