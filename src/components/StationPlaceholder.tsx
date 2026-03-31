export default function StationPlaceholder() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        minHeight: '300px',
      }}
    >
      <span style={{ color: 'var(--crt-tertiary)', fontSize: '18px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        STATION OFFLINE
      </span>
    </div>
  )
}
