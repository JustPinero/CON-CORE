import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getCommand } from '../terminal/CommandRegistry'

// Mock the services before importing commands
vi.mock('../../services/gmail', () => ({
  getSenders: vi.fn().mockResolvedValue({
    data: [
      { senderAddress: 'deals@bestbuy.com', senderName: 'Best Buy', messageCount: 847 },
      { senderAddress: 'noreply@github.com', senderName: 'GitHub', messageCount: 234 },
    ],
    error: null,
    meta: {},
  }),
  batchDelete: vi.fn().mockResolvedValue({ data: { deleted: 635 }, error: null, meta: {} }),
  batchArchive: vi.fn().mockResolvedValue({ data: { archived: 200 }, error: null, meta: {} }),
  executeUnsubscribe: vi.fn().mockResolvedValue({ data: { executed: true }, error: null, meta: {} }),
}))

vi.mock('../../services/claude', () => ({
  analyzeSender: vi.fn().mockResolvedValue({
    data: {
      senderAddress: 'deals@bestbuy.com',
      categoryBreakdown: { promo: 75, transactional: 20, work: 0, personal: 0, newsletter: 5, system: 0 },
      dossier: 'RETAIL ELECTRONICS PROMOTIONS',
      sampledMessages: 20,
    },
    error: null,
    meta: {},
  }),
}))

// Import after mocks are set up
import './comms.commands'
import { getSenders, batchDelete, batchArchive, executeUnsubscribe } from '../../services/gmail'
import { analyzeSender } from '../../services/claude'

describe('comms commands', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('is registered in CommandRegistry', () => {
    const cmd = getCommand('comms')
    expect(cmd).toBeDefined()
    expect(cmd?.name).toBe('comms')
  })

  it('comms list calls getSenders and formats output', async () => {
    const cmd = getCommand('comms')!
    const result = await cmd.handler(['list'])
    expect(getSenders).toHaveBeenCalled()
    expect(result).toContain('Best Buy')
    expect(result).toContain('847')
    expect(result).toContain('SENDERS (2 TOTAL)')
  })

  it('comms analyze calls analyzeSender', async () => {
    const cmd = getCommand('comms')!
    const result = await cmd.handler(['analyze', 'deals@bestbuy.com'])
    expect(analyzeSender).toHaveBeenCalledWith('deals@bestbuy.com')
    expect(result).toContain('PROMO:         75%')
    expect(result).toContain('RETAIL ELECTRONICS PROMOTIONS')
  })

  it('comms delete calls batchDelete', async () => {
    const cmd = getCommand('comms')!
    const result = await cmd.handler(['delete', 'deals@bestbuy.com'])
    expect(batchDelete).toHaveBeenCalledWith('deals@bestbuy.com')
    expect(result).toContain('635 EMAILS DELETED')
  })

  it('comms archive calls batchArchive', async () => {
    const cmd = getCommand('comms')!
    const result = await cmd.handler(['archive', 'deals@bestbuy.com'])
    expect(batchArchive).toHaveBeenCalledWith('deals@bestbuy.com')
    expect(result).toContain('200 EMAILS ARCHIVED')
  })

  it('comms unsubscribe calls executeUnsubscribe', async () => {
    const cmd = getCommand('comms')!
    const result = await cmd.handler(['unsubscribe', 'deals@bestbuy.com'])
    expect(executeUnsubscribe).toHaveBeenCalledWith('deals@bestbuy.com')
    expect(result).toContain('UNSUBSCRIBE REQUEST SENT')
  })

  it('comms with no args shows help', async () => {
    const cmd = getCommand('comms')!
    const result = await cmd.handler([])
    expect(result).toContain('COMMS COMMANDS:')
    expect(result).toContain('comms list')
  })

  it('comms with missing sender returns error', async () => {
    const cmd = getCommand('comms')!
    const result = await cmd.handler(['analyze'])
    expect(result).toContain('SENDER ADDRESS REQUIRED')
  })

  it('comms with unknown subcommand returns error', async () => {
    const cmd = getCommand('comms')!
    const result = await cmd.handler(['foobar', 'test@test.com'])
    expect(result).toContain('UNKNOWN SUBCOMMAND')
  })
})
