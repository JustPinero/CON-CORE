import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import Homepage from './Homepage'
import { STATIONS } from '../utils/types'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

function renderHomepage() {
  return render(
    <MemoryRouter>
      <Homepage />
    </MemoryRouter>,
  )
}

describe('Homepage', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
  })

  it('renders all 9 station buttons', () => {
    renderHomepage()
    STATIONS.forEach((station) => {
      expect(screen.getByText(station.name)).toBeInTheDocument()
    })
  })

  it('shows station names in uppercase', () => {
    renderHomepage()
    STATIONS.forEach((station) => {
      const el = screen.getByText(station.name)
      expect(el.textContent).toBe(station.name)
    })
  })

  it('shows F-key label for each station', () => {
    renderHomepage()
    STATIONS.forEach((station) => {
      expect(screen.getByText(`[${station.fkey}]`)).toBeInTheDocument()
    })
  })

  it('renders CON-CORE title', () => {
    renderHomepage()
    expect(screen.getByText('CON-CORE')).toBeInTheDocument()
  })

  it('navigates to station on button click', () => {
    renderHomepage()
    fireEvent.click(screen.getByText('COMMS'))
    expect(mockNavigate).toHaveBeenCalledWith('/station/comms')
  })

  it('navigates to COMMS on F1 key', () => {
    renderHomepage()
    fireEvent.keyDown(window, { key: 'F1' })
    expect(mockNavigate).toHaveBeenCalledWith('/station/comms')
  })

  it('navigates to TERMINAL on F9 key', () => {
    renderHomepage()
    fireEvent.keyDown(window, { key: 'F9' })
    expect(mockNavigate).toHaveBeenCalledWith('/station/terminal')
  })

  it('does not navigate on non-F keys', () => {
    renderHomepage()
    fireEvent.keyDown(window, { key: 'a' })
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})
