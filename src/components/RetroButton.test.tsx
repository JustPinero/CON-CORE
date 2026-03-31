import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import RetroButton from './RetroButton'

describe('RetroButton', () => {
  it('renders with retro-button class', () => {
    render(<RetroButton>TEST</RetroButton>)
    const btn = screen.getByRole('button', { name: 'TEST' })
    expect(btn).toHaveClass('retro-button')
  })

  it('applies danger variant class', () => {
    render(<RetroButton variant="danger">DELETE</RetroButton>)
    const btn = screen.getByRole('button', { name: 'DELETE' })
    expect(btn).toHaveClass('retro-button--danger')
  })

  it('applies active class when active', () => {
    render(<RetroButton active>ACTIVE</RetroButton>)
    const btn = screen.getByRole('button', { name: 'ACTIVE' })
    expect(btn).toHaveClass('active')
  })

  it('passes through additional className', () => {
    render(<RetroButton className="custom">BTN</RetroButton>)
    const btn = screen.getByRole('button', { name: 'BTN' })
    expect(btn).toHaveClass('retro-button', 'custom')
  })
})
