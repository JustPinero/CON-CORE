import { useState, useEffect, useCallback } from 'react'
import Shell from '../../components/Shell'
import SenderRolodex from './SenderRolodex'
import SourceIntel from './SourceIntel'
import { getSenders, type SenderEntry } from '../../services/gmail'

export default function CommsStation() {
  const [senders, setSenders] = useState<SenderEntry[]>([])
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusMessage, setStatusMessage] = useState('LOADING SENDERS...')
  const [statusVariant, setStatusVariant] = useState<'ready' | 'processing' | 'error'>('processing')

  const loadSenders = useCallback(async () => {
    setStatusMessage('SCANNING GMAIL SERVERS...')
    setStatusVariant('processing')
    const result = await getSenders()
    if (result.data) {
      setSenders(result.data)
      setStatusMessage(`${result.data.length} SENDERS LOADED`)
      setStatusVariant('ready')
    } else {
      setStatusMessage(`ERROR: ${result.error}`)
      setStatusVariant('error')
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadSenders()
  }, [loadSenders])

  const selectedSender = senders.find((s) => s.senderAddress === selectedAddress)

  function handleStatusChange(message: string, variant: 'ready' | 'processing' | 'error') {
    setStatusMessage(message)
    setStatusVariant(variant)
  }

  return (
    <Shell stationName="COMMS" statusMessage={statusMessage} statusVariant={loading ? 'processing' : statusVariant}>
      <div style={{ display: 'flex', gap: 'var(--space-3)', height: 'calc(100vh - 128px)' }}>
        <div style={{ width: '340px', flexShrink: 0 }}>
          <SenderRolodex
            senders={senders}
            selectedAddress={selectedAddress}
            onSelect={setSelectedAddress}
          />
        </div>

        <div
          style={{
            flex: 1,
            border: '1px solid var(--crt-primary)',
            overflow: 'auto',
          }}
        >
          {selectedSender ? (
            <SourceIntel
              key={selectedSender.senderAddress}
              sender={selectedSender}
              onStatusChange={handleStatusChange}
              onSenderUpdated={loadSenders}
            />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <span style={{ color: 'var(--crt-tertiary)', textTransform: 'uppercase' }}>
                SELECT A SENDER TO ANALYZE
              </span>
            </div>
          )}
        </div>
      </div>
    </Shell>
  )
}
