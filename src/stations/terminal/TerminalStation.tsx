import { useState, useCallback } from 'react'
import Shell from '../../components/Shell'
import TerminalInput from './TerminalInput'
import TerminalOutput, { type OutputLine } from './TerminalOutput'
import { parseInput, getCommand } from './CommandRegistry'

export default function TerminalStation() {
  const [lines, setLines] = useState<OutputLine[]>([
    { type: 'output', text: 'CON-CORE TERMINAL v0.1.0' },
    { type: 'output', text: 'TYPE "HELP" FOR AVAILABLE COMMANDS.' },
    { type: 'output', text: '' },
  ])
  const [history, setHistory] = useState<string[]>([])
  const [statusMessage, setStatusMessage] = useState('READY')

  const handleSubmit = useCallback(async (input: string) => {
    setHistory((prev) => [...prev, input])

    const { command, args } = parseInput(input)

    const cmd = getCommand(command)

    if (!cmd) {
      setLines((prev) => [
        ...prev,
        { type: 'input', text: input },
        { type: 'error', text: `UNKNOWN COMMAND: ${command}` },
      ])
      return
    }

    setLines((prev) => [...prev, { type: 'input', text: input }])
    setStatusMessage('PROCESSING...')

    try {
      const result = await cmd.handler(args)
      if (result === '__CLEAR__') {
        setLines([])
      } else {
        setLines((prev) => [...prev, { type: 'output', text: result }])
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Command failed'
      setLines((prev) => [...prev, { type: 'error', text: `ERROR: ${message}` }])
    }

    setStatusMessage('READY')
  }, [])

  return (
    <Shell stationName="TERMINAL" statusMessage={statusMessage}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 128px)',
        }}
      >
        <TerminalOutput lines={lines} />
        <TerminalInput onSubmit={handleSubmit} history={history} />
      </div>
    </Shell>
  )
}
