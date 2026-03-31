import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import BootSequence, { SESSION_KEY } from './BootSequence'

describe('BootSequence', () => {
  beforeEach(() => {
    sessionStorage.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders first boot line after initial delay', () => {
    const onComplete = vi.fn()
    render(<BootSequence onComplete={onComplete} />)

    act(() => {
      vi.advanceTimersByTime(120)
    })

    expect(screen.getByText('CON-CORE v0.1.0')).toBeInTheDocument()
  })

  it('renders blinking cursor during boot', () => {
    const onComplete = vi.fn()
    render(<BootSequence onComplete={onComplete} />)
    expect(screen.getByText('▌')).toBeInTheDocument()
  })

  it('skips boot sequence on keypress', () => {
    const onComplete = vi.fn()
    render(<BootSequence onComplete={onComplete} />)

    fireEvent.keyDown(window, { key: 'Enter' })

    expect(onComplete).toHaveBeenCalled()
  })

  it('sets session flag when skipped', () => {
    const onComplete = vi.fn()
    render(<BootSequence onComplete={onComplete} />)

    fireEvent.keyDown(window, { key: 'Enter' })

    expect(sessionStorage.getItem(SESSION_KEY)).toBe('1')
  })

  it('sets session flag after boot completes', () => {
    const onComplete = vi.fn()
    render(<BootSequence onComplete={onComplete} />)

    // Advance through all lines + completion delay, stepping one tick at a time
    for (let i = 0; i < 25; i++) {
      act(() => {
        vi.advanceTimersByTime(120)
      })
    }
    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(sessionStorage.getItem(SESSION_KEY)).toBe('1')
    expect(onComplete).toHaveBeenCalled()
  })
})
