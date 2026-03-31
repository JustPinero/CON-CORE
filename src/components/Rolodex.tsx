import { useState, useRef } from 'react'
import RetroButton from './RetroButton'

export interface RolodexItem {
  id: string
  label: string
  detail?: string
}

interface RolodexProps {
  items: RolodexItem[]
  selectedId: string | null
  onSelect: (id: string) => void
  placeholder?: string
  emptyMessage?: string
}

export default function Rolodex({
  items,
  selectedId,
  onSelect,
  placeholder = 'SEARCH...',
  emptyMessage = 'NO ITEMS FOUND',
}: RolodexProps) {
  const [search, setSearch] = useState('')
  const listRef = useRef<HTMLDivElement>(null)

  const filtered = items.filter(
    (item) =>
      item.label.toLowerCase().includes(search.toLowerCase()) ||
      item.id.toLowerCase().includes(search.toLowerCase()),
  )

  function scrollList(direction: 'up' | 'down') {
    if (!listRef.current) return
    const amount = direction === 'up' ? -200 : 200
    listRef.current.scrollBy({ top: amount })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={placeholder}
        aria-label="Search"
        style={{
          width: '100%',
          padding: '8px 16px',
          background: 'var(--crt-bg-light)',
          border: '1px solid var(--crt-primary)',
          borderRadius: 0,
          color: 'var(--crt-primary)',
          fontFamily: "'Courier New', Courier, monospace",
          fontSize: '14px',
          outline: 'none',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '8px',
        }}
      />

      <div
        style={{
          fontSize: '11px',
          color: 'var(--crt-tertiary)',
          marginBottom: '4px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        SHOWING {filtered.length} OF {items.length}
      </div>

      <div
        ref={listRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          border: '1px solid var(--crt-primary)',
        }}
      >
        {filtered.length === 0 ? (
          <div
            style={{
              padding: '24px 16px',
              textAlign: 'center',
              color: 'var(--crt-tertiary)',
              textTransform: 'uppercase',
            }}
          >
            {emptyMessage}
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelect(item.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onSelect(item.id)}
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid var(--crt-primary)',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: selectedId === item.id ? 'var(--crt-primary)' : 'transparent',
                color: selectedId === item.id ? 'var(--crt-bg)' : 'var(--crt-primary)',
              }}
            >
              <span
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  marginRight: '8px',
                }}
              >
                {item.label}
              </span>
              {item.detail && (
                <span style={{ flexShrink: 0, fontSize: '12px' }}>{item.detail}</span>
              )}
            </div>
          ))
        )}
      </div>

      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
        <RetroButton onClick={() => scrollList('up')} style={{ flex: 1 }}>
          UP
        </RetroButton>
        <RetroButton onClick={() => scrollList('down')} style={{ flex: 1 }}>
          DOWN
        </RetroButton>
      </div>
    </div>
  )
}
