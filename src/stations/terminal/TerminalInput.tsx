import { useState, useEffect, useRef } from 'react'
import { tabComplete } from './TabComplete'

interface TerminalInputProps {
  onSubmit: (input: string) => void
  onTabResult?: (options: string[]) => void
  history: string[]
}

export default function TerminalInput({ onSubmit, onTabResult, history }: TerminalInputProps) {
  const [value, setValue] = useState('')
  const [historyIndex, setHistoryIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && value.trim()) {
      onSubmit(value.trim())
      setValue('')
      setHistoryIndex(-1)
    } else if (e.key === 'Tab') {
      e.preventDefault()
      const result = tabComplete(value)
      if (result.type === 'complete') {
        setValue(result.value + ' ')
      } else if (result.type === 'ambiguous') {
        if (result.value.length > value.length) {
          setValue(result.value)
        }
        onTabResult?.(result.options)
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const newIndex = Math.min(historyIndex + 1, history.length - 1)
      setHistoryIndex(newIndex)
      if (newIndex >= 0 && newIndex < history.length) {
        setValue(history[history.length - 1 - newIndex])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const newIndex = historyIndex - 1
      if (newIndex < 0) {
        setHistoryIndex(-1)
        setValue('')
      } else {
        setHistoryIndex(newIndex)
        setValue(history[history.length - 1 - newIndex])
      }
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--space-2)',
        borderTop: '1px solid var(--crt-primary)',
        height: '40px',
        background: 'var(--crt-bg)',
      }}
    >
      <span style={{ color: 'var(--crt-primary)', marginRight: '8px' }}>&gt;</span>
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        aria-label="Terminal input"
        style={{
          flex: 1,
          background: 'transparent',
          border: 'none',
          color: 'var(--crt-primary)',
          fontFamily: "'Courier New', Courier, monospace",
          fontSize: '14px',
          outline: 'none',
          caretColor: 'var(--crt-primary)',
        }}
      />
      <span className="cursor" style={{ color: 'var(--crt-primary)' }}>
        {'▌'}
      </span>
    </div>
  )
}
