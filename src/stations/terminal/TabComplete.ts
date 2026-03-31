import { getAllCommands } from './CommandRegistry'

export interface TabResult {
  type: 'complete' | 'ambiguous' | 'none'
  value: string
  options: string[]
}

export function tabComplete(input: string): TabResult {
  const commands = getAllCommands()
  const allNames = commands.map((c) => c.name)

  if (!input.trim()) {
    return {
      type: 'ambiguous',
      value: '',
      options: allNames,
    }
  }

  const lower = input.toLowerCase().trim()
  const matches = allNames.filter((name) => name.startsWith(lower))

  if (matches.length === 0) {
    return { type: 'none', value: input, options: [] }
  }

  if (matches.length === 1) {
    return { type: 'complete', value: matches[0], options: matches }
  }

  // Find longest common prefix
  const prefix = longestCommonPrefix(matches)
  return {
    type: 'ambiguous',
    value: prefix,
    options: matches,
  }
}

function longestCommonPrefix(strings: string[]): string {
  if (strings.length === 0) return ''
  let prefix = strings[0]
  for (let i = 1; i < strings.length; i++) {
    while (!strings[i].startsWith(prefix)) {
      prefix = prefix.slice(0, -1)
    }
  }
  return prefix
}
