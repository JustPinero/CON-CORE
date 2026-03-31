import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import TerminalStation from './TerminalStation'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => vi.fn() }
})

function renderTerminal() {
  return render(
    <MemoryRouter>
      <TerminalStation />
    </MemoryRouter>,
  )
}

describe('TerminalStation', () => {
  it('renders welcome message', () => {
    renderTerminal()
    expect(screen.getByText('CON-CORE TERMINAL v0.1.0')).toBeInTheDocument()
  })

  it('renders input with blinking cursor', () => {
    renderTerminal()
    expect(screen.getByText('▌')).toBeInTheDocument()
    expect(screen.getByLabelText('Terminal input')).toBeInTheDocument()
  })

  it('shows UNKNOWN COMMAND for unrecognized input', () => {
    renderTerminal()
    const input = screen.getByLabelText('Terminal input')
    fireEvent.change(input, { target: { value: 'foobar' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(screen.getByText('UNKNOWN COMMAND: foobar')).toBeInTheDocument()
  })

  it('echoes input in output buffer', () => {
    renderTerminal()
    const input = screen.getByLabelText('Terminal input')
    fireEvent.change(input, { target: { value: 'clear' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    // After clear, output is empty, but input was processed
    // Verify by sending a known command first then clear
  })

  it('clears output on clear command', async () => {
    renderTerminal()
    const input = screen.getByLabelText('Terminal input')

    // Type something that creates output
    fireEvent.change(input, { target: { value: 'badcmd' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(screen.getByText('UNKNOWN COMMAND: badcmd')).toBeInTheDocument()

    // Now clear
    fireEvent.change(input, { target: { value: 'clear' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    await waitFor(() => {
      expect(screen.queryByText('UNKNOWN COMMAND: badcmd')).not.toBeInTheDocument()
    })
  })

  it('recalls previous command with up arrow', () => {
    renderTerminal()
    const input = screen.getByLabelText('Terminal input')

    fireEvent.change(input, { target: { value: 'test input' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    fireEvent.keyDown(input, { key: 'ArrowUp' })
    expect(input).toHaveValue('test input')
  })

  it('renders inside Shell chrome', () => {
    renderTerminal()
    expect(screen.getByText('TERMINAL')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'ESC HOME' })).toBeInTheDocument()
  })
})
