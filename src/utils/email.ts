export function parseSender(from: string): { address: string; name: string } {
  const match = from.match(/^(?:"?([^"]*)"?\s)?<?([^>]+@[^>]+)>?$/)
  if (match) {
    return { name: match[1]?.trim() || match[2], address: match[2].toLowerCase() }
  }
  return { name: from, address: from.toLowerCase() }
}
