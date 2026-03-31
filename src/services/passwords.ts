import type { ApiResponse, PasswordAuditResult } from '../utils/types'

export interface PasswordRecord {
  accountName: string
  username: string
  password: string
  url: string
}

type CsvFormat = '1password' | 'bitwarden' | 'lastpass' | 'unknown'

export function detectCsvFormat(headers: string[]): CsvFormat {
  const lower = headers.map((h) => h.toLowerCase().trim())
  if (lower.includes('title') && lower.includes('username') && lower.includes('password') && lower.includes('url')) {
    return '1password'
  }
  if (lower.includes('name') && lower.includes('login_username') && lower.includes('login_password') && lower.includes('login_uri')) {
    return 'bitwarden'
  }
  if (lower.includes('name') && lower.includes('username') && lower.includes('password') && lower.includes('url')) {
    return 'lastpass'
  }
  return 'unknown'
}

export function parseCsv(text: string): PasswordRecord[] {
  const lines = text.split('\n').filter((l) => l.trim())
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map((h) => h.replace(/^"?|"?$/g, ''))
  const format = detectCsvFormat(headers)

  if (format === 'unknown') {
    throw new Error('Unrecognized CSV format. Supported: 1Password, Bitwarden, LastPass.')
  }

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line)
    const row: Record<string, string> = {}
    headers.forEach((h, i) => {
      row[h.toLowerCase().trim()] = values[i] || ''
    })

    if (format === '1password') {
      return { accountName: row.title, username: row.username, password: row.password, url: row.url }
    }
    if (format === 'bitwarden') {
      return { accountName: row.name, username: row.login_username, password: row.login_password, url: row.login_uri }
    }
    // lastpass
    return { accountName: row.name, username: row.username, password: row.password, url: row.url }
  })
}

function parseCsvLine(line: string): string[] {
  const values: string[] = []
  let current = ''
  let inQuotes = false

  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  values.push(current.trim())
  return values
}

export async function auditPasswords(
  records: PasswordRecord[],
): Promise<ApiResponse<PasswordAuditResult[]>> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30000)

  try {
    const res = await fetch('/api/claude/audit-passwords', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ records }),
      signal: controller.signal,
    })
    clearTimeout(timeout)
    const json = await res.json()
    if (!res.ok) return { data: null, error: json.error || 'Audit failed', meta: {} }
    return json
  } catch (err) {
    clearTimeout(timeout)
    if (err instanceof DOMException && err.name === 'AbortError') {
      return { data: null, error: 'Request timed out', meta: {} }
    }
    return { data: null, error: 'Network error', meta: {} }
  }
}
