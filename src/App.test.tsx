import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, beforeEach } from 'vitest'
import App from './App'
import { SESSION_KEY } from './components/BootSequence'

describe('App', () => {
  beforeEach(() => {
    sessionStorage.setItem(SESSION_KEY, '1')
  })

  it('renders homepage at root route when booted', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )
    expect(screen.getByText('CON-CORE')).toBeInTheDocument()
  })

  it('renders File Recon station', () => {
    render(
      <MemoryRouter initialEntries={['/station/filerecon']}>
        <App />
      </MemoryRouter>,
    )
    expect(screen.getByText('FILE RECON')).toBeInTheDocument()
    expect(screen.getByText('FILE RECONNAISSANCE')).toBeInTheDocument()
  })

  it('shows boot sequence when not yet booted', () => {
    sessionStorage.clear()
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )
    expect(screen.getByText('▌')).toBeInTheDocument()
  })
})
