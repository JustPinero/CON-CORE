import { registerCommand } from '../terminal/CommandRegistry'

registerCommand({
  name: 'recon',
  description: 'File reconnaissance — scan, largest, oldest, purge',
  usage: 'recon <scan|largest|oldest|purge>',
  handler: async (args: string[]) => {
    const subcommand = args[0]?.toLowerCase()
    if (!subcommand || subcommand === 'help') {
      return [
        'FILE RECON COMMANDS:',
        '  recon scan                              Run file scan (use GUI)',
        '  recon largest                           Show largest files (use GUI)',
        '  recon oldest                            Show oldest files (use GUI)',
        '  recon purge                             Delete recommended files (use GUI)',
        '',
        'NOTE: FILE RECON REQUIRES THE GUI. NAVIGATE TO FILE RECON STATION (F7).',
      ].join('\n')
    }
    return 'FILE RECON REQUIRES GUI. NAVIGATE TO FILE RECON STATION (F7).'
  },
})
