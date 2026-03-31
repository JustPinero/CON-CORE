interface ProgressBarProps {
  label?: string
  percent: number
  width?: number
}

export default function ProgressBar({ label = 'PROCESSING...', percent, width = 20 }: ProgressBarProps) {
  const filled = Math.round((percent / 100) * width)
  const empty = width - filled
  const bar = '█'.repeat(filled) + '░'.repeat(empty)

  return (
    <div style={{ fontFamily: "'Courier New', Courier, monospace", fontSize: '14px' }}>
      <div style={{ color: 'var(--crt-warning)', textTransform: 'uppercase', marginBottom: '4px' }}>
        {label}
      </div>
      <div>
        <span style={{ color: 'var(--crt-primary)' }}>[{bar}]</span>
        <span style={{ color: 'var(--crt-tertiary)', marginLeft: '8px' }}>{Math.round(percent)}%</span>
      </div>
    </div>
  )
}
