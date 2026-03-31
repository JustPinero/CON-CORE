import { useState, useEffect } from 'react'
import Shell from '../../components/Shell'
import SenderRolodex from './SenderRolodex'
import { getSenders, type SenderEntry } from '../../services/gmail'

export default function CommsStation() {
  const [senders, setSenders] = useState<SenderEntry[]>([])
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusMessage, setStatusMessage] = useState('LOADING SENDERS...')

  useEffect(() => {
    async function load() {
      setStatusMessage('SCANNING GMAIL SERVERS...')
      const result = await getSenders()
      if (result.data) {
        setSenders(result.data)
        setStatusMessage(`${result.data.length} SENDERS LOADED`)
      } else {
        setStatusMessage(`ERROR: ${result.error}`)
      }
      setLoading(false)
    }
    load()
  }, [])

  const selectedSender = senders.find((s) => s.senderAddress === selectedAddress)

  return (
    <Shell
      stationName="COMMS"
      statusMessage={statusMessage}
      statusVariant={loading ? 'processing' : 'ready'}
    >
      <div style={{ display: 'flex', gap: 'var(--space-3)', height: 'calc(100vh - 128px)' }}>
        {/* Left panel: Sender Rolodex */}
        <div style={{ width: '340px', flexShrink: 0 }}>
          <SenderRolodex
            senders={senders}
            selectedAddress={selectedAddress}
            onSelect={setSelectedAddress}
          />
        </div>

        {/* Right panel: Source Intel (placeholder) */}
        <div
          style={{
            flex: 1,
            border: '1px solid var(--crt-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {selectedSender ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '16px', textTransform: 'uppercase', marginBottom: '8px' }}>
                {selectedSender.senderName}
              </div>
              <div style={{ color: 'var(--crt-secondary)', fontSize: '12px' }}>
                {selectedSender.senderAddress}
              </div>
              <div style={{ color: 'var(--crt-tertiary)', marginTop: '16px' }}>
                {selectedSender.messageCount} MESSAGES
              </div>
              <div style={{ color: 'var(--crt-tertiary)', marginTop: '24px', fontSize: '12px' }}>
                ANALYSIS PENDING...
              </div>
            </div>
          ) : (
            <span style={{ color: 'var(--crt-tertiary)', textTransform: 'uppercase' }}>
              SELECT A SENDER TO ANALYZE
            </span>
          )}
        </div>
      </div>
    </Shell>
  )
}
