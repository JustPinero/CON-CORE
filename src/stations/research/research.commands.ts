import { registerCommand } from '../terminal/CommandRegistry'

registerCommand({
  name: 'research',
  description: 'Bookmark operations — import, scan, purge, list, move',
  usage: 'research <import|scan|purge-dead|list> [vault]',
  handler: async (args: string[]) => {
    const subcommand = args[0]?.toLowerCase()

    if (!subcommand || subcommand === 'help') {
      return [
        'RESEARCH COMMANDS:',
        '  research import                         Import Chrome bookmarks (use GUI)',
        '  research scan                           Scan bookmarks for dead links (use GUI)',
        '  research purge-dead                     Remove dead links (use GUI)',
        '  research list <vault>                   List bookmarks in vault (use GUI)',
        '',
        'NOTE: RESEARCH STATION OPERATIONS REQUIRE THE GUI FOR FILE UPLOAD.',
        'USE THE RESEARCH STATION DIRECTLY FOR FULL FUNCTIONALITY.',
      ].join('\n')
    }

    return 'RESEARCH OPERATIONS REQUIRE GUI. NAVIGATE TO RESEARCH STATION (F3).'
  },
})
