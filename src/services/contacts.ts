import type { ApiResponse, ContactRecord } from '../utils/types'

const REQUEST_TIMEOUT = 30000

export async function detectContactDupes(
  contacts: ContactRecord[],
): Promise<ApiResponse<{ groups: ContactRecord[][] }>> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

  try {
    const res = await fetch('/api/claude/detect-contacts-dupes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contacts }),
      signal: controller.signal,
    })
    clearTimeout(timeout)
    const json = await res.json()
    if (!res.ok) return { data: null, error: json.error || 'Detection failed', meta: {} }
    return json
  } catch (err) {
    clearTimeout(timeout)
    if (err instanceof DOMException && err.name === 'AbortError') {
      return { data: null, error: 'Request timed out', meta: {} }
    }
    return { data: null, error: 'Network error', meta: {} }
  }
}

export function parseCsvContacts(text: string): ContactRecord[] {
  const lines = text.split('\n').filter((l) => l.trim())
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map((h) => h.replace(/^"?|"?$/g, '').toLowerCase().trim())

  return lines.slice(1).map((line, i) => {
    const values = line.split(',').map((v) => v.replace(/^"?|"?$/g, '').trim())
    const row: Record<string, string> = {}
    headers.forEach((h, j) => {
      row[h] = values[j] || ''
    })

    return {
      id: `contact-${i}`,
      name: row.name || row['first name'] || row.first_name || '',
      email: row.email || row['email address'] || row.e_mail || '',
      phone: row.phone || row['phone number'] || row.telephone || '',
      source: 'csv',
      duplicateGroupId: null,
    }
  })
}

export function mergeContacts(
  contacts: ContactRecord[],
  keepFields: Record<string, string>,
): ContactRecord {
  const merged: ContactRecord = {
    id: contacts[0].id,
    name: keepFields.name || contacts[0].name,
    email: keepFields.email || contacts[0].email,
    phone: keepFields.phone || contacts[0].phone,
    source: contacts[0].source,
    duplicateGroupId: null,
  }
  return merged
}
