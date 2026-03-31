import { describe, it, expect } from 'vitest'
import { getCommand, getAllCommands, parseInput, registerCommand } from './CommandRegistry'

describe('CommandRegistry', () => {
  it('returns handler for known command (clear)', () => {
    const cmd = getCommand('clear')
    expect(cmd).toBeDefined()
    expect(cmd?.name).toBe('clear')
  })

  it('returns undefined for unknown command', () => {
    const cmd = getCommand('nonexistent')
    expect(cmd).toBeUndefined()
  })

  it('lists all registered commands', () => {
    const cmds = getAllCommands()
    expect(cmds.length).toBeGreaterThanOrEqual(1)
    expect(cmds.some((c) => c.name === 'clear')).toBe(true)
  })

  it('allows registering new commands', () => {
    registerCommand({
      name: 'test-cmd',
      description: 'Test command',
      usage: 'test-cmd',
      handler: () => 'test output',
    })
    const cmd = getCommand('test-cmd')
    expect(cmd).toBeDefined()
    expect(cmd?.handler([])).toBe('test output')
  })
})

describe('parseInput', () => {
  it('splits simple command', () => {
    const result = parseInput('comms list')
    expect(result.command).toBe('comms')
    expect(result.args).toEqual(['list'])
  })

  it('handles quoted strings', () => {
    const result = parseInput('queue add "buy groceries"')
    expect(result.command).toBe('queue')
    expect(result.args).toEqual(['add', 'buy groceries'])
  })

  it('handles single quotes', () => {
    const result = parseInput("queue add 'do laundry'")
    expect(result.command).toBe('queue')
    expect(result.args).toEqual(['add', 'do laundry'])
  })

  it('lowercases command name', () => {
    const result = parseInput('CLEAR')
    expect(result.command).toBe('clear')
  })

  it('handles empty input', () => {
    const result = parseInput('')
    expect(result.command).toBe('')
    expect(result.args).toEqual([])
  })

  it('handles multiple spaces', () => {
    const result = parseInput('comms   list   senders')
    expect(result.command).toBe('comms')
    expect(result.args).toEqual(['list', 'senders'])
  })
})
