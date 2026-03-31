import { describe, it, expect } from 'vitest'
import { parseCsv, detectCsvFormat } from './passwords'

describe('detectCsvFormat', () => {
  it('detects 1Password format', () => {
    expect(detectCsvFormat(['Title', 'Username', 'Password', 'URL'])).toBe('1password')
  })

  it('detects Bitwarden format', () => {
    expect(detectCsvFormat(['name', 'login_username', 'login_password', 'login_uri'])).toBe('bitwarden')
  })

  it('detects LastPass format', () => {
    expect(detectCsvFormat(['name', 'username', 'password', 'url'])).toBe('lastpass')
  })

  it('returns unknown for unrecognized headers', () => {
    expect(detectCsvFormat(['col1', 'col2'])).toBe('unknown')
  })
})

describe('parseCsv', () => {
  it('parses 1Password CSV', () => {
    const csv = 'Title,Username,Password,URL\nGmail,user@gmail.com,pass123,https://gmail.com'
    const result = parseCsv(csv)
    expect(result).toHaveLength(1)
    expect(result[0].accountName).toBe('Gmail')
    expect(result[0].username).toBe('user@gmail.com')
    expect(result[0].password).toBe('pass123')
    expect(result[0].url).toBe('https://gmail.com')
  })

  it('parses Bitwarden CSV', () => {
    const csv = 'name,login_username,login_password,login_uri\nGitHub,dev@test.com,secret,https://github.com'
    const result = parseCsv(csv)
    expect(result).toHaveLength(1)
    expect(result[0].accountName).toBe('GitHub')
  })

  it('parses LastPass CSV', () => {
    const csv = 'name,username,password,url\nTwitter,user,pw,https://twitter.com'
    const result = parseCsv(csv)
    expect(result).toHaveLength(1)
    expect(result[0].accountName).toBe('Twitter')
  })

  it('handles quoted CSV values', () => {
    const csv = 'Title,Username,Password,URL\n"My Account","user@test.com","pass,word","https://example.com"'
    const result = parseCsv(csv)
    expect(result[0].password).toBe('pass,word')
  })

  it('throws on unknown format', () => {
    expect(() => parseCsv('a,b,c\n1,2,3')).toThrow('Unrecognized CSV format')
  })

  it('returns empty for header-only CSV', () => {
    expect(parseCsv('Title,Username,Password,URL')).toHaveLength(0)
  })
})
