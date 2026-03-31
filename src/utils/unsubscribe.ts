export function extractUnsubscribeUrl(header: string): string | null {
  const httpMatch = header.match(/<(https?:\/\/[^>]+)>/)
  if (httpMatch) return httpMatch[1]

  const mailtoMatch = header.match(/<(mailto:[^>]+)>/)
  if (mailtoMatch) return mailtoMatch[1]

  return null
}
