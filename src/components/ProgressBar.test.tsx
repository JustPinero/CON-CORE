import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ProgressBar from './ProgressBar'

describe('ProgressBar', () => {
  it('renders label and percentage', () => {
    render(<ProgressBar label="LOADING..." percent={50} />)
    expect(screen.getByText('LOADING...')).toBeInTheDocument()
    expect(screen.getByText('50%')).toBeInTheDocument()
  })

  it('renders full bar at 100%', () => {
    render(<ProgressBar percent={100} width={10} />)
    expect(screen.getByText('[██████████]')).toBeInTheDocument()
  })

  it('renders empty bar at 0%', () => {
    render(<ProgressBar percent={0} width={10} />)
    expect(screen.getByText('[░░░░░░░░░░]')).toBeInTheDocument()
  })
})
