import { describe, it, expect } from 'vitest'
import { z } from 'zod'

const envSchema = z.object({
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_REDIRECT_URI: z.string().url(),
  ANTHROPIC_API_KEY: z.string().min(1),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SESSION_SECRET: z.string().min(32),
})

describe('env validation', () => {
  it('fails on empty env', () => {
    const result = envSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('fails when SESSION_SECRET is too short', () => {
    const result = envSchema.safeParse({
      GOOGLE_CLIENT_ID: 'test',
      GOOGLE_CLIENT_SECRET: 'test',
      GOOGLE_REDIRECT_URI: 'http://localhost:3000/api/auth/callback',
      ANTHROPIC_API_KEY: 'sk-test',
      SUPABASE_URL: 'https://test.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'test',
      SESSION_SECRET: 'short',
    })
    expect(result.success).toBe(false)
  })

  it('passes with valid env', () => {
    const result = envSchema.safeParse({
      GOOGLE_CLIENT_ID: 'test-client-id',
      GOOGLE_CLIENT_SECRET: 'test-client-secret',
      GOOGLE_REDIRECT_URI: 'http://localhost:3000/api/auth/callback',
      ANTHROPIC_API_KEY: 'sk-ant-test-key',
      SUPABASE_URL: 'https://test.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
      SESSION_SECRET: 'a]b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
    })
    expect(result.success).toBe(true)
  })
})
