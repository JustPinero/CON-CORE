import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'

function getKey(): Buffer {
  const secret = process.env.SESSION_SECRET
  if (!secret || secret.length < 32) {
    throw new Error('SESSION_SECRET must be at least 32 characters')
  }
  return Buffer.from(secret.slice(0, 32), 'utf-8')
}

export function encrypt(text: string): string {
  const key = getKey()
  const iv = randomBytes(16)
  const cipher = createCipheriv(ALGORITHM, key, iv)
  let encrypted = cipher.update(text, 'utf-8', 'hex')
  encrypted += cipher.final('hex')
  const tag = cipher.getAuthTag().toString('hex')
  return `${iv.toString('hex')}:${tag}:${encrypted}`
}

export function decrypt(payload: string): string {
  const key = getKey()
  const [ivHex, tagHex, encrypted] = payload.split(':')
  const iv = Buffer.from(ivHex, 'hex')
  const tag = Buffer.from(tagHex, 'hex')
  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(tag)
  let decrypted = decipher.update(encrypted, 'hex', 'utf-8')
  decrypted += decipher.final('utf-8')
  return decrypted
}
