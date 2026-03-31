import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Rolodex from './Rolodex'

const mockItems = [
  { id: 'a@test.com', label: 'Alice', detail: '100' },
  { id: 'b@test.com', label: 'Bob', detail: '50' },
  { id: 'c@test.com', label: 'Charlie', detail: '25' },
]

describe('Rolodex', () => {
  it('renders list of items', () => {
    render(<Rolodex items={mockItems} selectedId={null} onSelect={vi.fn()} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.getByText('Charlie')).toBeInTheDocument()
  })

  it('shows item count', () => {
    render(<Rolodex items={mockItems} selectedId={null} onSelect={vi.fn()} />)
    expect(screen.getByText('SHOWING 3 OF 3')).toBeInTheDocument()
  })

  it('filters items by search input', () => {
    render(<Rolodex items={mockItems} selectedId={null} onSelect={vi.fn()} />)
    const search = screen.getByLabelText('Search')
    fireEvent.change(search, { target: { value: 'alice' } })
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.queryByText('Bob')).not.toBeInTheDocument()
    expect(screen.getByText('SHOWING 1 OF 3')).toBeInTheDocument()
  })

  it('calls onSelect when item is clicked', () => {
    const onSelect = vi.fn()
    render(<Rolodex items={mockItems} selectedId={null} onSelect={onSelect} />)
    fireEvent.click(screen.getByText('Bob'))
    expect(onSelect).toHaveBeenCalledWith('b@test.com')
  })

  it('shows empty message when no items match', () => {
    render(<Rolodex items={mockItems} selectedId={null} onSelect={vi.fn()} />)
    const search = screen.getByLabelText('Search')
    fireEvent.change(search, { target: { value: 'zzzzz' } })
    expect(screen.getByText('NO ITEMS FOUND')).toBeInTheDocument()
  })

  it('shows custom empty message', () => {
    render(
      <Rolodex
        items={[]}
        selectedId={null}
        onSelect={vi.fn()}
        emptyMessage="NO SENDERS FOUND"
      />,
    )
    expect(screen.getByText('NO SENDERS FOUND')).toBeInTheDocument()
  })

  it('renders UP and DOWN buttons', () => {
    render(<Rolodex items={mockItems} selectedId={null} onSelect={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'UP' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'DOWN' })).toBeInTheDocument()
  })

  it('highlights selected item', () => {
    render(<Rolodex items={mockItems} selectedId="b@test.com" onSelect={vi.fn()} />)
    const bob = screen.getByText('Bob').closest('[role="button"]')
    expect(bob).toHaveStyle({ background: 'var(--crt-primary)' })
  })
})
