import { useRef } from 'react'
import RetroButton from './RetroButton'

interface HorizontalNavProps {
  items: string[]
  selectedItem: string | null
  onSelect: (item: string) => void
}

export default function HorizontalNav({ items, selectedItem, onSelect }: HorizontalNavProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  function scroll(direction: 'left' | 'right') {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({ left: direction === 'left' ? -200 : 200 })
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <RetroButton
        onClick={() => scroll('left')}
        style={{ minHeight: '40px', width: '40px', padding: 0, flexShrink: 0 }}
      >
        {'<'}
      </RetroButton>

      <div
        ref={scrollRef}
        style={{
          display: 'flex',
          gap: '0',
          overflowX: 'auto',
          flex: 1,
          scrollbarWidth: 'none',
        }}
      >
        {items.map((item) => (
          <button
            key={item}
            onClick={() => onSelect(item)}
            style={{
              padding: '8px 16px',
              background: selectedItem === item ? 'var(--crt-primary)' : 'transparent',
              color: selectedItem === item ? 'var(--crt-bg)' : 'var(--crt-secondary)',
              border: 'none',
              borderRight: '1px solid var(--crt-primary)',
              fontFamily: "'Courier New', Courier, monospace",
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              borderRadius: 0,
              minHeight: '40px',
            }}
          >
            {item}
          </button>
        ))}
      </div>

      <RetroButton
        onClick={() => scroll('right')}
        style={{ minHeight: '40px', width: '40px', padding: 0, flexShrink: 0 }}
      >
        {'>'}
      </RetroButton>
    </div>
  )
}
