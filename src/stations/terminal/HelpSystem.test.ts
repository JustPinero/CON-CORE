import { describe, it, expect } from 'vitest'
import { getHelpText, getCommandHelp } from './HelpSystem'

describe('HelpSystem', () => {
  it('lists all registered commands', () => {
    const text = getHelpText()
    expect(text).toContain('AVAILABLE COMMANDS:')
    expect(text).toContain('clear')
    expect(text).toContain('help')
  })

  it('shows detail for specific command', () => {
    const text = getCommandHelp('clear')
    expect(text).toContain('COMMAND: CLEAR')
    expect(text).toContain('USAGE:')
    expect(text).toContain('Clear the terminal output')
  })

  it('shows detail for help command', () => {
    const text = getCommandHelp('help')
    expect(text).toContain('COMMAND: HELP')
    expect(text).toContain('help [command]')
  })

  it('returns UNKNOWN COMMAND for nonexistent command', () => {
    const text = getCommandHelp('foobar')
    expect(text).toContain('UNKNOWN COMMAND: foobar')
  })
})
