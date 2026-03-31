import { registerCommand } from '../terminal/CommandRegistry'
import { getQueue, addToQueue, popQueue } from '../../services/taskqueue'

registerCommand({
  name: 'queue',
  description: 'Task queue — add, next, list, pop',
  usage: 'queue <add|next|list|pop> [text]',
  handler: async (args: string[]) => {
    const subcommand = args[0]?.toLowerCase()

    if (!subcommand || subcommand === 'help') {
      return [
        'TASK QUEUE COMMANDS:',
        '  queue add <text>                        Add item to queue',
        '  queue next                              Show next item',
        '  queue list                              List all items',
        '  queue pop                               Remove and show first item',
      ].join('\n')
    }

    if (subcommand === 'list') {
      const result = await getQueue()
      if (!result.data || result.data.length === 0) return 'QUEUE EMPTY'
      return result.data
        .map((item, i) => `  [${String(i + 1).padStart(2, '0')}] ${item.text}`)
        .join('\n')
    }

    if (subcommand === 'add') {
      const text = args.slice(1).join(' ')
      if (!text) return 'USAGE: queue add <text>'
      const result = await addToQueue(text)
      if (result.data) return `ADDED: ${result.data.text}`
      return `ERROR: ${result.error}`
    }

    if (subcommand === 'next') {
      const result = await getQueue()
      if (!result.data || result.data.length === 0) return 'QUEUE EMPTY'
      return `NEXT: ${result.data[0].text}`
    }

    if (subcommand === 'pop') {
      const result = await popQueue()
      if (result.data) return `POPPED: ${result.data.text}`
      return 'QUEUE EMPTY'
    }

    return `UNKNOWN SUBCOMMAND: ${subcommand}. TYPE "QUEUE HELP" FOR USAGE.`
  },
})
