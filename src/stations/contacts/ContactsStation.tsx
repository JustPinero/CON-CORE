import { useState, useRef } from 'react'
import Shell from '../../components/Shell'
import RetroButton from '../../components/RetroButton'
import DupeGroups from './DupeGroups'
import { parseCsvContacts, detectContactDupes, mergeContacts } from '../../services/contacts'
import type { ContactRecord } from '../../utils/types'

export default function ContactsStation() {
  const [contacts, setContacts] = useState<ContactRecord[]>([])
  const [dupeGroups, setDupeGroups] = useState<ContactRecord[][]>([])
  const [statusMessage, setStatusMessage] = useState('AWAITING CONTACT IMPORT')
  const [imported, setImported] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFileUpload(file: File) {
    try {
      setStatusMessage('PARSING CONTACTS...')
      const text = await file.text()
      const parsed = parseCsvContacts(text)

      if (parsed.length === 0) {
        setStatusMessage('NO CONTACTS FOUND IN CSV')
        return
      }

      setContacts(parsed)
      setStatusMessage(`${parsed.length} CONTACTS PARSED. SCANNING FOR DUPLICATES...`)

      const result = await detectContactDupes(parsed)
      if (result.data) {
        setDupeGroups(result.data.groups)
        setImported(true)
        setStatusMessage(`${parsed.length} CONTACTS — ${result.data.groups.length} DUPLICATE GROUPS`)
      } else {
        setDupeGroups([])
        setImported(true)
        setStatusMessage(`${parsed.length} CONTACTS LOADED (DEDUP UNAVAILABLE)`)
      }
    } catch (err) {
      setStatusMessage(`ERROR: ${err instanceof Error ? err.message : 'Import failed'}`)
    }
  }

  function handleMerge(group: ContactRecord[]) {
    const merged = mergeContacts(group, {
      name: group[0].name,
      email: group[0].email,
      phone: group.find((c) => c.phone)?.phone || '',
    })

    const groupIds = new Set(group.map((c) => c.id))
    setContacts((prev) => [
      ...prev.filter((c) => !groupIds.has(c.id)),
      merged,
    ])
    setDupeGroups((prev) => prev.filter((g) => g !== group))
    setStatusMessage(`MERGED ${group.length} CONTACTS INTO 1`)
  }

  if (!imported) {
    return (
      <Shell stationName="CONTACTS" statusMessage={statusMessage}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: 'var(--space-3)' }}>
          <div style={{ textTransform: 'uppercase', fontSize: '14px' }}>CONTACT DEDUP</div>
          <div style={{ color: 'var(--crt-secondary)', fontSize: '12px', textTransform: 'uppercase' }}>
            UPLOAD A CSV OF YOUR CONTACTS TO SCAN FOR DUPLICATES
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
        </div>
      </Shell>
    )
  }

  return (
    <Shell stationName="CONTACTS" statusMessage={statusMessage}>
      <div style={{ marginBottom: 'var(--space-2)', fontSize: '14px', textTransform: 'uppercase' }}>
        {contacts.length} CONTACTS
      </div>
      <DupeGroups groups={dupeGroups} onMerge={handleMerge} />
    </Shell>
  )
}
