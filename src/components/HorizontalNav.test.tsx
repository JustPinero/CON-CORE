import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import HorizontalNav from './HorizontalNav'

const items = ['DEVELOPMENT', 'DESIGN', 'NEWS', 'SHOPPING']

describe('HorizontalNav', () => {
  it('renders all categories', () => {
    render(<HorizontalNav items={items} selectedItem={null} onSelect={vi.fn()} />)
    items.forEach((item) => {
      expect(screen.getByText(item)).toBeInTheDocument()
    })
  })

  it('highlights selected item with inverted colors', () => {
    render(<HorizontalNav items={items} selectedItem="DESIGN" onSelect={vi.fn()} />)
    const btn = screen.getByText('DESIGN')
    expect(btn).toHaveStyle({ background: 'var(--crt-primary)' })
  })

  it('triggers callback on click', () => {
    const onSelect = vi.fn()
    render(<HorizontalNav items={items} selectedItem={null} onSelect={onSelect} />)
    fireEvent.click(screen.getByText('NEWS'))
    expect(onSelect).toHaveBeenCalledWith('NEWS')
  })

  it('renders left and right arrow buttons', () => {
    render(<HorizontalNav items={items} selectedItem={null} onSelect={vi.fn()} />)
    expect(screen.getByText('<')).toBeInTheDocument()
    expect(screen.getByText('>')).toBeInTheDocument()
  })
})
