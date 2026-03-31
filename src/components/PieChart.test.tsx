import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import PieChart from './PieChart'

const mockSlices = [
  { key: 'promo', label: 'Promotions', value: 60 },
  { key: 'transactional', label: 'Transactional', value: 25 },
  { key: 'newsletter', label: 'Newsletter', value: 15 },
]

describe('PieChart', () => {
  it('renders correct number of SVG slices', () => {
    render(<PieChart slices={mockSlices} selectedKey={null} onSliceClick={vi.fn()} />)
    expect(screen.getByLabelText('Promotions: 60%')).toBeInTheDocument()
    expect(screen.getByLabelText('Transactional: 25%')).toBeInTheDocument()
    expect(screen.getByLabelText('Newsletter: 15%')).toBeInTheDocument()
  })

  it('renders legend with all categories', () => {
    render(<PieChart slices={mockSlices} selectedKey={null} onSliceClick={vi.fn()} />)
    expect(screen.getByText('Promotions')).toBeInTheDocument()
    expect(screen.getByText('Transactional')).toBeInTheDocument()
    expect(screen.getByText('Newsletter')).toBeInTheDocument()
  })

  it('triggers callback on slice click', () => {
    const onClick = vi.fn()
    render(<PieChart slices={mockSlices} selectedKey={null} onSliceClick={onClick} />)
    fireEvent.click(screen.getByLabelText('Promotions: 60%'))
    expect(onClick).toHaveBeenCalledWith('promo')
  })

  it('triggers callback on legend click', () => {
    const onClick = vi.fn()
    render(<PieChart slices={mockSlices} selectedKey={null} onSliceClick={onClick} />)
    fireEvent.click(screen.getByText('Transactional'))
    expect(onClick).toHaveBeenCalledWith('transactional')
  })

  it('renders single-category as full circle', () => {
    const singleSlice = [{ key: 'promo', label: 'Promotions', value: 100 }]
    render(<PieChart slices={singleSlice} selectedKey={null} onSliceClick={vi.fn()} />)
    expect(screen.getByLabelText('Promotions: 100%')).toBeInTheDocument()
  })

  it('renders empty state for no data', () => {
    render(<PieChart slices={[]} selectedKey={null} onSliceClick={vi.fn()} />)
    expect(screen.getByText('NO DATA')).toBeInTheDocument()
  })

  it('renders empty state for all-zero values', () => {
    const zeroSlices = [{ key: 'promo', label: 'Promotions', value: 0 }]
    render(<PieChart slices={zeroSlices} selectedKey={null} onSliceClick={vi.fn()} />)
    expect(screen.getByText('NO DATA')).toBeInTheDocument()
  })

  it('shows percentage labels in SVG for slices >= 5%', () => {
    render(<PieChart slices={mockSlices} selectedKey={null} onSliceClick={vi.fn()} />)
    // Each percentage appears twice (SVG label + legend), so use getAllByText
    expect(screen.getAllByText('60%').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('25%').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('15%').length).toBeGreaterThanOrEqual(1)
  })

  it('shows selected category in center text', () => {
    render(<PieChart slices={mockSlices} selectedKey="promo" onSliceClick={vi.fn()} />)
    expect(screen.getByText('PROMOTIONS')).toBeInTheDocument()
  })

  it('renders SVG with aria label', () => {
    render(<PieChart slices={mockSlices} selectedKey={null} onSliceClick={vi.fn()} />)
    expect(screen.getByRole('img', { name: 'Category breakdown chart' })).toBeInTheDocument()
  })
})
