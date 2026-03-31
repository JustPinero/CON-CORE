import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ActionButtons from './ActionButtons'

describe('ActionButtons', () => {
  const mockButtons = [
    { key: 'delete', label: 'DELETE ALL', variant: 'danger' as const, onClick: vi.fn() },
    { key: 'archive', label: 'ARCHIVE ALL', onClick: vi.fn() },
    { key: 'cancel', label: 'CANCEL', onClick: vi.fn() },
  ]

  it('renders all buttons', () => {
    render(<ActionButtons buttons={mockButtons} />)
    expect(screen.getByRole('button', { name: 'DELETE ALL' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'ARCHIVE ALL' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'CANCEL' })).toBeInTheDocument()
  })

  it('applies danger variant to delete button', () => {
    render(<ActionButtons buttons={mockButtons} />)
    const deleteBtn = screen.getByRole('button', { name: 'DELETE ALL' })
    expect(deleteBtn).toHaveClass('retro-button--danger')
  })

  it('calls onClick handler when button clicked', () => {
    render(<ActionButtons buttons={mockButtons} />)
    fireEvent.click(screen.getByRole('button', { name: 'CANCEL' }))
    expect(mockButtons[2].onClick).toHaveBeenCalled()
  })

  it('renders disabled button', () => {
    const buttons = [{ key: 'test', label: 'DISABLED', onClick: vi.fn(), disabled: true }]
    render(<ActionButtons buttons={buttons} />)
    expect(screen.getByRole('button', { name: 'DISABLED' })).toBeDisabled()
  })
})
