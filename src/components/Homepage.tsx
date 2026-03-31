import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { STATIONS } from '../utils/types'
import RetroButton from './RetroButton'

export default function Homepage() {
  const navigate = useNavigate()

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const fKeyIndex = parseInt(e.key.replace('F', ''), 10) - 1
      if (e.key.startsWith('F') && fKeyIndex >= 0 && fKeyIndex < STATIONS.length) {
        e.preventDefault()
        navigate(STATIONS[fKeyIndex].path)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigate])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '64px' }}>
      <h1 className="glow" style={{ fontSize: '28px', marginBottom: 'var(--space-1)', letterSpacing: '0.15em' }}>
        CON-CORE
      </h1>
      <p style={{ color: 'var(--crt-secondary)', marginBottom: 'var(--space-4)', fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        CONSOLIDATED OPERATIONS CORE
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 200px)',
          gap: 'var(--space-1)',
        }}
      >
        {STATIONS.map((station) => (
          <RetroButton
            key={station.id}
            onClick={() => navigate(station.path)}
            style={{
              minHeight: '80px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
            }}
          >
            <span>{station.name}</span>
            <span style={{ fontSize: '11px', color: 'var(--crt-tertiary)' }}>[{station.fkey}]</span>
          </RetroButton>
        ))}
      </div>
    </div>
  )
}
