import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import CommsStation from './CommsStation'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => vi.fn() }
})

vi.mock('../../services/gmail', () => ({
  getSenders: vi.fn().mockResolvedValue({
    data: [
      { senderAddress: 'deals@bestbuy.com', senderName: 'Best Buy', messageCount: 847 },
      { senderAddress: 'noreply@github.com', senderName: 'GitHub', messageCount: 234 },
    ],
    error: null,
    meta: { totalSenders: 2, pagesScanned: 1, truncated: false },
  }),
}))

function renderComms() {
  return render(
    <MemoryRouter>
      <CommsStation />
    </MemoryRouter>,
  )
}

describe('CommsStation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders two-panel layout with COMMS header', async () => {
    renderComms()
    expect(screen.getByText('COMMS')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByText('Best Buy')).toBeInTheDocument()
    })
  })

  it('shows sender list after loading', async () => {
    renderComms()
    await waitFor(() => {
      expect(screen.getByText('Best Buy')).toBeInTheDocument()
      expect(screen.getByText('GitHub')).toBeInTheDocument()
    })
  })

  it('shows placeholder when no sender selected', async () => {
    renderComms()
    await waitFor(() => {
      expect(screen.getByText('SELECT A SENDER TO ANALYZE')).toBeInTheDocument()
    })
  })

  it('renders inside Shell chrome with ESC HOME', () => {
    renderComms()
    expect(screen.getByRole('button', { name: 'ESC HOME' })).toBeInTheDocument()
  })
})
