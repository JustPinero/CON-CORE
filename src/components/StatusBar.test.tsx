import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import StatusBar from './StatusBar'

describe('StatusBar', () => {
  it('renders default READY message', () => {
    render(<StatusBar />)
    expect(screen.getByText('READY')).toBeInTheDocument()
  })

  it('renders custom message', () => {
    render(<StatusBar message="PROCESSING 42 ITEMS..." variant="processing" />)
    expect(screen.getByText('PROCESSING 42 ITEMS...')).toBeInTheDocument()
  })

  it('renders error message', () => {
    render(<StatusBar message="CONNECTION FAILED" variant="error" />)
    expect(screen.getByText('CONNECTION FAILED')).toBeInTheDocument()
  })
})
