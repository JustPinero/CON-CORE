import { useEffect, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import RetroButton from './RetroButton'
import StatusBar from './StatusBar'

interface ShellProps {
  stationName: string
  children: ReactNode
  statusMessage?: string
  statusVariant?: 'ready' | 'processing' | 'error'
}

export default function Shell({
  stationName,
  children,
  statusMessage,
  statusVariant,
}: ShellProps) {
  const navigate = useNavigate()

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        navigate('/')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigate])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header
        style={{
          height: '48px',
          borderBottom: '1px solid var(--crt-primary)',
          background: 'var(--crt-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 var(--space-4)',
        }}
      >
        <span
          className="glow"
          style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '14px' }}
        >
          {stationName}
        </span>
        <RetroButton
          onClick={() => navigate('/')}
          style={{ minHeight: '32px', padding: '4px 12px', fontSize: '12px' }}
        >
          ESC HOME
        </RetroButton>
      </header>

      <main style={{ flex: 1, padding: 'var(--space-4)', paddingBottom: '48px' }}>{children}</main>

      <StatusBar message={statusMessage} variant={statusVariant} />
    </div>
  )
}
