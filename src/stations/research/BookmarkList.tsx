import { type CategorizedBookmark } from '../../services/bookmarks'

interface BookmarkListProps {
  bookmarks: CategorizedBookmark[]
  selectedIds: Set<string>
  onToggleSelect: (id: string) => void
}

const STATUS_COLORS = {
  alive: 'var(--crt-primary)',
  dead: 'var(--crt-danger)',
  dupe: 'var(--crt-warning)',
}

export default function BookmarkList({ bookmarks, selectedIds, onToggleSelect }: BookmarkListProps) {
  const deadCount = bookmarks.filter((b) => b.status === 'dead').length
  const dupeCount = bookmarks.filter((b) => b.status === 'dupe').length

  return (
    <div>
      <div style={{ fontSize: '11px', color: 'var(--crt-tertiary)', marginBottom: '8px', textTransform: 'uppercase', display: 'flex', gap: '16px' }}>
        <span>TOTAL: {bookmarks.length}</span>
        {deadCount > 0 && <span style={{ color: 'var(--crt-danger)' }}>DEAD: {deadCount}</span>}
        {dupeCount > 0 && <span style={{ color: 'var(--crt-warning)' }}>DUPES: {dupeCount}</span>}
      </div>

      <div style={{ border: '1px solid var(--crt-primary)', maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>
        {bookmarks.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--crt-tertiary)', textTransform: 'uppercase' }}>
            NO BOOKMARKS IN VAULT
          </div>
        ) : (
          bookmarks.map((bm) => (
            <div
              key={bm.id}
              onClick={() => onToggleSelect(bm.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onToggleSelect(bm.id)}
              style={{
                padding: '8px 16px',
                borderBottom: '1px solid var(--crt-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: selectedIds.has(bm.id) ? 'var(--crt-bg-light)' : 'transparent',
              }}
            >
              <span style={{ color: selectedIds.has(bm.id) ? 'var(--crt-primary)' : 'var(--crt-tertiary)', width: '16px' }}>
                {selectedIds.has(bm.id) ? '[X]' : '[ ]'}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '13px' }}>
                  {bm.title}
                </div>
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '11px', color: 'var(--crt-tertiary)' }}>
                  {bm.url}
                </div>
              </div>
              <span style={{ fontSize: '10px', padding: '2px 6px', border: `1px solid ${STATUS_COLORS[bm.status]}`, color: STATUS_COLORS[bm.status], textTransform: 'uppercase', flexShrink: 0 }}>
                {bm.status}{bm.status === 'dupe' && bm.dupeCount > 0 ? ` (${bm.dupeCount})` : ''}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
