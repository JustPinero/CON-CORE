import { useEffect, useRef } from 'react'

export interface OutputLine {
  type: 'input' | 'output' | 'error'
  text: string
}

interface TerminalOutputProps {
  lines: OutputLine[]
}

export default function TerminalOutput({ lines }: TerminalOutputProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView?.({ block: 'end' })
  }, [lines.length])

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: 'var(--space-2)',
        fontFamily: "'Courier New', Courier, monospace",
        fontSize: '14px',
        lineHeight: '1.4',
      }}
    >
      {lines.map((line, i) => (
        <div
          key={i}
          style={{
            color:
              line.type === 'error'
                ? 'var(--crt-danger)'
                : line.type === 'input'
                  ? 'var(--crt-secondary)'
                  : 'var(--crt-primary)',
            whiteSpace: 'pre-wrap',
            minHeight: '20px',
          }}
        >
          {line.type === 'input' ? `> ${line.text}` : line.text}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
