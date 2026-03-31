export interface CommandDef {
  name: string
  description: string
  usage: string
  handler: (args: string[]) => string | Promise<string>
}

const commands: Map<string, CommandDef> = new Map()

export function registerCommand(def: CommandDef) {
  commands.set(def.name, def)
}

export function getCommand(name: string): CommandDef | undefined {
  return commands.get(name)
}

export function getAllCommands(): CommandDef[] {
  return Array.from(commands.values())
}

export function parseInput(input: string): { command: string; args: string[] } {
  const tokens: string[] = []
  let current = ''
  let inQuote = false
  let quoteChar = ''

  for (const char of input) {
    if (inQuote) {
      if (char === quoteChar) {
        inQuote = false
      } else {
        current += char
      }
    } else if (char === '"' || char === "'") {
      inQuote = true
      quoteChar = char
    } else if (char === ' ') {
      if (current) {
        tokens.push(current)
        current = ''
      }
    } else {
      current += char
    }
  }
  if (current) tokens.push(current)

  const [command = '', ...args] = tokens
  return { command: command.toLowerCase(), args }
}

// Built-in: clear
registerCommand({
  name: 'clear',
  description: 'Clear the terminal output',
  usage: 'clear',
  handler: () => '__CLEAR__',
})
