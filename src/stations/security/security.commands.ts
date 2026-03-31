import { registerCommand } from '../terminal/CommandRegistry'

registerCommand({
  name: 'security',
  description: 'Password audit — requires GUI for CSV upload',
  usage: 'security <audit|report>',
  handler: async (args: string[]) => {
    const subcommand = args[0]?.toLowerCase()

    if (!subcommand || subcommand === 'help') {
      return [
        'SECURITY COMMANDS:',
        '  security audit <file>                   Upload + audit password CSV (use GUI)',
        '  security report                         Show threat summary (use GUI)',
        '',
        'NOTE: PASSWORD DATA IS NEVER STORED. USE SECURITY STATION (F4) FOR FULL AUDIT.',
      ].join('\n')
    }

    return 'SECURITY OPERATIONS REQUIRE GUI FOR CSV UPLOAD. NAVIGATE TO SECURITY STATION (F4).'
  },
})
