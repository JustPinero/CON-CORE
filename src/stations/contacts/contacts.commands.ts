import { registerCommand } from '../terminal/CommandRegistry'

registerCommand({
  name: 'contacts',
  description: 'Contact dedup — requires GUI for CSV upload',
  usage: 'contacts <scan|merge>',
  handler: async (args: string[]) => {
    const subcommand = args[0]?.toLowerCase()

    if (!subcommand || subcommand === 'help') {
      return [
        'CONTACTS COMMANDS:',
        '  contacts scan                           Scan for duplicates (use GUI)',
        '  contacts merge <group-id>               Merge duplicate group (use GUI)',
        '',
        'NOTE: USE CONTACTS STATION (F6) FOR FULL FUNCTIONALITY.',
      ].join('\n')
    }

    return 'CONTACTS OPERATIONS REQUIRE GUI FOR CSV UPLOAD. NAVIGATE TO CONTACTS STATION (F6).'
  },
})
