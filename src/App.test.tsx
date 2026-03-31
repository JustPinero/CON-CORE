import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders homepage at root route', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )
    expect(screen.getByText('CON-CORE')).toBeInTheDocument()
  })

  it('renders station placeholder for station routes', () => {
    render(
      <MemoryRouter initialEntries={['/station/comms']}>
        <App />
      </MemoryRouter>,
    )
    expect(screen.getByText('STATION PLACEHOLDER')).toBeInTheDocument()
  })
})
