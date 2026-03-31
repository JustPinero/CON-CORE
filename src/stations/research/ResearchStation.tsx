import { useState, useRef } from 'react'
import Shell from '../../components/Shell'
import RetroButton from '../../components/RetroButton'
import ActionButtons from '../../components/ActionButtons'
import VaultNav from './VaultNav'
import BookmarkList from './BookmarkList'
import {
  parseChromeBookmarks,
  categorizeBookmarks,
  detectDuplicates,
  type BookmarkVault,
  type CategorizedBookmark,
} from '../../services/bookmarks'

export default function ResearchStation() {
  const [vaults, setVaults] = useState<BookmarkVault[]>([])
  const [selectedVault, setSelectedVault] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [statusMessage, setStatusMessage] = useState('AWAITING BOOKMARK IMPORT')
  const [imported, setImported] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentVault = vaults.find((v) => v.name === selectedVault)

  async function handleFileUpload(file: File) {
    try {
      setStatusMessage('PARSING BOOKMARKS...')
      const text = await file.text()
      const parsed = parseChromeBookmarks(text)

      if (parsed.length === 0) {
        setStatusMessage('NO BOOKMARKS FOUND IN FILE')
        return
      }

      setStatusMessage(`${parsed.length} BOOKMARKS PARSED. CATEGORIZING...`)

      const result = await categorizeBookmarks(parsed)
      if (result.data) {
        // Run duplicate detection on all bookmarks
        const withDupes = result.data.map((vault) => ({
          ...vault,
          bookmarks: detectDuplicates(vault.bookmarks),
        }))
        setVaults(withDupes)
        setSelectedVault(withDupes[0]?.name || null)
        setImported(true)
        setStatusMessage(`${parsed.length} BOOKMARKS IN ${withDupes.length} VAULTS`)
      } else {
        setStatusMessage(`ERROR: ${result.error}`)
      }
    } catch (err) {
      setStatusMessage(`ERROR: ${err instanceof Error ? err.message : 'Import failed'}`)
    }
  }

  function handleToggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleDeleteSelected() {
    if (!selectedVault || selectedIds.size === 0) return
    setVaults((prev) =>
      prev.map((v) =>
        v.name === selectedVault
          ? { ...v, bookmarks: v.bookmarks.filter((b) => !selectedIds.has(b.id)) }
          : v,
      ),
    )
    setStatusMessage(`${selectedIds.size} BOOKMARKS DELETED`)
    setSelectedIds(new Set())
  }

  function handlePurgeDead() {
    if (!selectedVault) return
    const vault = vaults.find((v) => v.name === selectedVault)
    const deadCount = vault?.bookmarks.filter((b) => b.status === 'dead').length || 0
    setVaults((prev) =>
      prev.map((v) =>
        v.name === selectedVault
          ? { ...v, bookmarks: v.bookmarks.filter((b) => b.status !== 'dead') }
          : v,
      ),
    )
    setStatusMessage(`${deadCount} DEAD LINKS PURGED`)
  }

  async function handleScanAll() {
    if (!currentVault) return
    setStatusMessage('SCANNING LINKS...')
    // Scan bookmarks for dead links (HEAD requests via browser)
    const updated = await Promise.all(
      currentVault.bookmarks.map(async (bm) => {
        try {
          const res = await fetch(bm.url, { method: 'HEAD', mode: 'no-cors' })
          return { ...bm, status: (res.ok || res.type === 'opaque' ? bm.status : 'dead') as CategorizedBookmark['status'] }
        } catch {
          return { ...bm, status: 'dead' as const }
        }
      }),
    )
    setVaults((prev) =>
      prev.map((v) => (v.name === selectedVault ? { ...v, bookmarks: updated } : v)),
    )
    const deadCount = updated.filter((b) => b.status === 'dead').length
    setStatusMessage(`SCAN COMPLETE. ${deadCount} DEAD LINKS FOUND`)
  }

  if (!imported) {
    return (
      <Shell stationName="RESEARCH" statusMessage={statusMessage}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: 'var(--space-3)' }}>
          <div style={{ textTransform: 'uppercase', fontSize: '14px' }}>IMPORT CHROME BOOKMARKS</div>
          <div style={{ color: 'var(--crt-secondary)', fontSize: '12px', textTransform: 'uppercase' }}>
            EXPORT FROM CHROME: BOOKMARKS MANAGER &gt; ... &gt; EXPORT BOOKMARKS
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".html,.json"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFileUpload(file)
            }}
          />
          <RetroButton onClick={() => fileInputRef.current?.click()} style={{ minHeight: '64px', padding: '16px 48px' }}>
            SELECT FILE
          </RetroButton>
        </div>
      </Shell>
    )
  }

  return (
    <Shell stationName="RESEARCH" statusMessage={statusMessage}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <VaultNav vaults={vaults} selectedVault={selectedVault} onSelect={(name) => { setSelectedVault(name); setSelectedIds(new Set()) }} />

        {currentVault && (
          <>
            <BookmarkList
              bookmarks={currentVault.bookmarks}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
            />

            <ActionButtons
              buttons={[
                { key: 'scan', label: 'SCAN ALL', onClick: handleScanAll },
                { key: 'purge', label: 'PURGE DEAD', variant: 'danger', onClick: handlePurgeDead },
                { key: 'delete', label: 'DELETE SELECTED', variant: 'danger', onClick: handleDeleteSelected, disabled: selectedIds.size === 0 },
              ]}
            />
          </>
        )}
      </div>
    </Shell>
  )
}
