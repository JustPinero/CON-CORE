import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ErrorDisplay from './ErrorDisplay'

describe('ErrorDisplay', () => {
  it('renders error code and message', () => {
    render(<ErrorDisplay code="404" message="Resource not found" />)
    expect(screen.getByText('SYSTEM ERROR [404]')).toBeInTheDocument()
    expect(screen.getByText('Resource not found')).toBeInTheDocument()
  })

  it('uses default ERR code', () => {
    render(<ErrorDisplay message="Something went wrong" />)
    expect(screen.getByText('SYSTEM ERROR [ERR]')).toBeInTheDocument()
  })
})
