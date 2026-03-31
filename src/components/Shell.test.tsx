import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import Shell from './Shell'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

function renderShell(stationName = 'COMMS') {
  return render(
    <MemoryRouter>
      <Shell stationName={stationName}>
        <div>STATION CONTENT</div>
      </Shell>
    </MemoryRouter>,
  )
}

describe('Shell', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
  })

  it('renders station name in header', () => {
    renderShell('COMMS')
    expect(screen.getByText('COMMS')).toBeInTheDocument()
  })

  it('renders ESC HOME button', () => {
    renderShell()
    expect(screen.getByRole('button', { name: 'ESC HOME' })).toBeInTheDocument()
  })

  it('renders children content', () => {
    renderShell()
    expect(screen.getByText('STATION CONTENT')).toBeInTheDocument()
  })

  it('navigates to homepage on ESC HOME click', () => {
    renderShell()
    fireEvent.click(screen.getByRole('button', { name: 'ESC HOME' }))
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('navigates to homepage on ESC key', () => {
    renderShell()
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('renders status bar with default READY message', () => {
    renderShell()
    expect(screen.getByText('READY')).toBeInTheDocument()
  })
})
