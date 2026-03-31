import { useState, useEffect, useCallback, useRef } from 'react'

const BOOT_LINES = [
  'CON-CORE v0.1.0',
  'CONSOLIDATED OPERATIONS CORE',
  '',
  'INITIALIZING SYSTEM...',
  'LOADING MODULES [9 STATIONS]...',
  '  > COMMS .............. OK',
  '  > SCHEDULE ........... OK',
  '  > RESEARCH ........... OK',
  '  > SECURITY ........... OK',
  '  > SUBSCRIPTIONS ...... OK',
  '  > CONTACTS ........... OK',
  '  > FILE RECON ......... OK',
  '  > TASK QUEUE ......... OK',
  '  > TERMINAL ........... OK',
  '',
  'CHECKING API CONNECTIONS...',
  '  > GMAIL API .......... STANDBY',
  '  > CALENDAR API ....... STANDBY',
  '  > CLAUDE API ......... STANDBY',
  '',
  'ALL SYSTEMS NOMINAL.',
  'SYSTEM READY.',
]

const LINE_DELAY = 120
const SESSION_KEY = 'con-core-booted'

interface BootSequenceProps {
  onComplete: () => void
}

export default function BootSequence({ onComplete }: BootSequenceProps) {
  const [visibleLines, setVisibleLines] = useState<number>(0)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const skip = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    sessionStorage.setItem(SESSION_KEY, '1')
    onComplete()
  }, [onComplete])

  useEffect(() => {
    function handleKey() {
      skip()
    }
    function handleClick() {
      skip()
    }

    window.addEventListener('keydown', handleKey)
    window.addEventListener('click', handleClick)
    return () => {
      window.removeEventListener('keydown', handleKey)
      window.removeEventListener('click', handleClick)
    }
  }, [skip])

  useEffect(() => {
    if (visibleLines < BOOT_LINES.length) {
      timeoutRef.current = setTimeout(() => {
        setVisibleLines((prev) => prev + 1)
      }, LINE_DELAY)
      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
      }
    } else {
      const done = setTimeout(() => {
        sessionStorage.setItem(SESSION_KEY, '1')
        onComplete()
      }, 500)
      return () => clearTimeout(done)
    }
  }, [visibleLines, onComplete])

  return (
    <div
      style={{
        background: 'var(--crt-bg)',
        minHeight: '100vh',
        padding: 'var(--space-4)',
        fontFamily: "'Courier New', Courier, monospace",
        fontSize: '14px',
        color: 'var(--crt-primary)',
      }}
    >
      {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
        <div key={i} style={{ minHeight: '20px', whiteSpace: 'pre' }}>
          {line}
        </div>
      ))}
      {visibleLines < BOOT_LINES.length && <span className="cursor">{'▌'}</span>}
    </div>
  )
}

export { SESSION_KEY }
