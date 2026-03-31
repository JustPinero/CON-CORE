import { useState, useRef } from 'react'
import Shell from '../../components/Shell'
import RetroButton from '../../components/RetroButton'
import ThreatReport from './ThreatReport'
import { parseCsv, auditPasswords, type PasswordRecord } from '../../services/passwords'
import type { PasswordAuditResult } from '../../utils/types'

export default function SecurityStation() {
  // SECURITY: All data in React state only — cleared on unmount
  const [records, setRecords] = useState<PasswordRecord[]>([])
  const [results, setResults] = useState<PasswordAuditResult[]>([])
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState('AWAITING PASSWORD CSV')
  const [audited, setAudited] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFileUpload(file: File) {
    try {
      setStatusMessage('PARSING CSV...')
      const text = await file.text()
      const parsed = parseCsv(text)

      if (parsed.length === 0) {
        setStatusMessage('NO ACCOUNTS FOUND IN CSV')
        return
      }

      setRecords(parsed)
      setStatusMessage(`${parsed.length} ACCOUNTS PARSED. RUNNING AUDIT...`)

      const result = await auditPasswords(parsed)
      if (result.data) {
        setResults(result.data)
        setAudited(true)
        const redCount = result.data.filter((r) => r.threatLevel === 'red').length
        setStatusMessage(`AUDIT COMPLETE. ${redCount} CRITICAL ISSUES FOUND`)
      } else {
        setStatusMessage(`ERROR: ${result.error}`)
      }
    } catch (err) {
      setStatusMessage(`ERROR: ${err instanceof Error ? err.message : 'Import failed'}`)
    }
  }

  if (!audited) {
    return (
      <Shell stationName="SECURITY" statusMessage={statusMessage}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: 'var(--space-3)' }}>
          <div style={{ textTransform: 'uppercase', fontSize: '14px' }}>PASSWORD AUDIT</div>
          <div style={{ color: 'var(--crt-secondary)', fontSize: '12px', textTransform: 'uppercase', textAlign: 'center', maxWidth: '500px' }}>
            UPLOAD A CSV EXPORT FROM YOUR PASSWORD MANAGER.<br />
            SUPPORTED: 1PASSWORD, BITWARDEN, LASTPASS.<br />
            DATA IS NEVER STORED — CLEARED WHEN YOU LEAVE.
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFileUpload(file)
            }}
          />
          <RetroButton onClick={() => fileInputRef.current?.click()} style={{ minHeight: '64px', padding: '16px 48px' }}>
            SELECT CSV FILE
          </RetroButton>
          <div style={{ color: 'var(--crt-danger)', fontSize: '11px', textTransform: 'uppercase' }}>
            {records.length > 0 ? `${records.length} ACCOUNTS LOADED` : ''}
          </div>
        </div>
      </Shell>
    )
  }

  return (
    <Shell stationName="SECURITY" statusMessage={statusMessage}>
      <ThreatReport
        results={results}
        selectedAccount={selectedAccount}
        onSelect={setSelectedAccount}
      />
    </Shell>
  )
}
