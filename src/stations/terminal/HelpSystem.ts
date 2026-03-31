import { getAllCommands, registerCommand, type CommandDef } from './CommandRegistry'

export function getHelpText(): string {
  const commands = getAllCommands()
  if (commands.length === 0) {
    return 'NO COMMANDS REGISTERED.'
  }

  const grouped = groupByStation(commands)
  const lines: string[] = ['AVAILABLE COMMANDS:', '']

  for (const [station, cmds] of Object.entries(grouped)) {
    lines.push(`  [${station.toUpperCase()}]`)
    for (const cmd of cmds) {
      lines.push(`    ${cmd.name.padEnd(20)} ${cmd.description}`)
    }
    lines.push('')
  }

  lines.push('TYPE "HELP <COMMAND>" FOR DETAILED USAGE.')
  return lines.join('\n')
}

export function getCommandHelp(commandName: string): string {
  const commands = getAllCommands()
  const cmd = commands.find((c) => c.name === commandName.toLowerCase())

  if (!cmd) {
    return `UNKNOWN COMMAND: ${commandName}`
  }

  return [`COMMAND: ${cmd.name.toUpperCase()}`, `USAGE:   ${cmd.usage}`, `         ${cmd.description}`].join('\n')
}

// Register help command
registerCommand({
  name: 'help',
  description: 'Show available commands or command details',
  usage: 'help [command]',
  handler: (args: string[]) => {
    if (args.length > 0) {
      return getCommandHelp(args[0])
    }
    return getHelpText()
  },
})

function groupByStation(commands: CommandDef[]): Record<string, CommandDef[]> {
  const groups: Record<string, CommandDef[]> = {}

  for (const cmd of commands) {
    const station = cmd.name.includes(' ') ? cmd.name.split(' ')[0] : 'SYSTEM'
    if (!groups[station]) groups[station] = []
    groups[station].push(cmd)
  }

  return groups
}
