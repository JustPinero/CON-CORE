import { registerCommand } from '../terminal/CommandRegistry'
import { getSenders, batchDelete, batchArchive, executeUnsubscribe } from '../../services/gmail'
import { analyzeSender } from '../../services/claude'

registerCommand({
  name: 'comms',
  description: 'Mail operations — list senders, analyze, delete, archive, unsubscribe',
  usage: 'comms <list|analyze|delete|archive|unsubscribe> [sender] [--category cat]',
  handler: async (args: string[]) => {
    const subcommand = args[0]?.toLowerCase()

    if (!subcommand || subcommand === 'help') {
      return [
        'COMMS COMMANDS:',
        '  comms list                              List all senders',
        '  comms analyze <sender>                  Analyze sender categories',
        '  comms delete <sender>                   Delete all from sender',
        '  comms archive <sender>                  Archive all from sender',
        '  comms unsubscribe <sender>              Unsubscribe from sender',
      ].join('\n')
    }

    if (subcommand === 'list') {
      const result = await getSenders()
      if (!result.data) return `ERROR: ${result.error}`
      if (result.data.length === 0) return 'NO SENDERS FOUND'
      const lines = result.data.slice(0, 50).map(
        (s) => `  ${s.senderName.padEnd(30)} ${String(s.messageCount).padStart(6)}  ${s.senderAddress}`,
      )
      return [`SENDERS (${result.data.length} TOTAL):`, '', ...lines].join('\n')
    }

    const senderAddress = args[1]
    if (!senderAddress) {
      return 'ERROR: SENDER ADDRESS REQUIRED'
    }

    if (subcommand === 'analyze') {
      const result = await analyzeSender(senderAddress)
      if (!result.data) return `ERROR: ${result.error}`
      const b = result.data.categoryBreakdown
      return [
        `SENDER: ${senderAddress}`,
        `DOSSIER: ${result.data.dossier}`,
        `SAMPLED: ${result.data.sampledMessages} MESSAGES`,
        '',
        'CATEGORY BREAKDOWN:',
        `  PROMO:         ${b.promo}%`,
        `  TRANSACTIONAL: ${b.transactional}%`,
        `  WORK:          ${b.work}%`,
        `  PERSONAL:      ${b.personal}%`,
        `  NEWSLETTER:    ${b.newsletter}%`,
        `  SYSTEM:        ${b.system}%`,
      ].join('\n')
    }

    if (subcommand === 'delete') {
      const result = await batchDelete(senderAddress)
      if (!result.data) return `ERROR: ${result.error}`
      return `${result.data.deleted} EMAILS DELETED FROM ${senderAddress}`
    }

    if (subcommand === 'archive') {
      const result = await batchArchive(senderAddress)
      if (!result.data) return `ERROR: ${result.error}`
      return `${result.data.archived} EMAILS ARCHIVED FROM ${senderAddress}`
    }

    if (subcommand === 'unsubscribe') {
      const result = await executeUnsubscribe(senderAddress)
      if (!result.data) return `ERROR: ${result.error}`
      return `UNSUBSCRIBE REQUEST SENT FOR ${senderAddress}`
    }

    return `UNKNOWN SUBCOMMAND: ${subcommand}. TYPE "COMMS HELP" FOR USAGE.`
  },
})
