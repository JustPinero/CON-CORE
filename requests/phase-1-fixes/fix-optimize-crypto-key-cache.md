# Fix: Cache derived key Buffer in `api/_utils/crypto.ts`

## Problem
`getKey()` is called inside both `encrypt()` and `decrypt()`. Each call allocates a new `Buffer` from `SESSION_SECRET` via `Buffer.from(secret.slice(0, 32), 'utf-8')`. In `callback.ts` this fires 2× per request (encrypt access + refresh tokens) and in `refresh.ts` another 2× (decrypt refresh + encrypt new access). These are unnecessary repeated allocations.

## Change
Cache the key Buffer at module level after first successful resolution:

```ts
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'

let _key: Buffer | null = null

function getKey(): Buffer {
  if (!_key) {
    const secret = process.env.SESSION_SECRET
    if (!secret || secret.length < 32) {
      throw new Error('SESSION_SECRET must be at least 32 characters')
    }
    _key = Buffer.from(secret.slice(0, 32), 'utf-8')
  }
  return _key
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
```

## Files
- `api/_utils/crypto.ts` — replace entire file with cached-key version above

## Notes
- The IV and auth tag are still generated/read fresh per operation (correct — IV must never be reused)
- Only the derived key Buffer is cached, not any per-operation crypto state
