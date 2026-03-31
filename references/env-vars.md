# CON-CORE Environment Variables

All environment variables required by the application. No actual values are stored in this file.

---

## Google OAuth2

| Variable | Description | Used In | Timing | Security Notes |
|---|---|---|---|---|
| `GOOGLE_CLIENT_ID` | Google OAuth2 client ID from Google Cloud Console | `/api/auth/*` routes | Runtime (server) | Not secret, but keep server-side to avoid exposing OAuth config |
| `GOOGLE_CLIENT_SECRET` | Google OAuth2 client secret | `/api/auth/*` routes | Runtime (server) | SECRET — never expose client-side |
| `GOOGLE_REDIRECT_URI` | OAuth callback URL (e.g., `https://your-app.vercel.app/api/auth/callback`) | `/api/auth/login`, `/api/auth/callback` | Runtime (server) | Must match exactly what is registered in Google Cloud Console |

## Supabase

| Variable | Description | Used In | Timing | Security Notes |
|---|---|---|---|---|
| `DATABASE_URL` | Direct PostgreSQL connection string for Supabase | Database migrations, direct DB access | Runtime (server) | SECRET — contains credentials for direct DB access |
| `SUPABASE_URL` | Supabase project URL (e.g., `https://xxxxx.supabase.co`) | All `/api/*` routes that access DB | Runtime (server) | Not secret, but keep server-side |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key — bypasses RLS | All `/api/*` routes that access DB | Runtime (server) | SECRET — full admin access to DB. Never expose client-side. Never use `anon` key server-side for admin ops |
| `SUPABASE_ANON_KEY` | Supabase anonymous/public key | Not currently used server-side (reserved for future use) | Runtime | Public key, safe to expose |

## Frontend (Build-Time)

| Variable | Description | Used In | Timing | Security Notes |
|---|---|---|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL for client-side access | Frontend Supabase client | Build-time (client) | Baked into JS bundle at build. Safe to expose — public project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous/public key for client-side access | Frontend Supabase client | Build-time (client) | Baked into JS bundle at build. Safe to expose — public anon key |

## Anthropic Claude

| Variable | Description | Used In | Timing | Security Notes |
|---|---|---|---|---|
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude access | `/api/claude/*` routes | Runtime (server) | SECRET — must be server-side only. Starts with `sk-ant-`. Never prefix with `VITE_` |

## Session Encryption

| Variable | Description | Used In | Timing | Security Notes |
|---|---|---|---|---|
| `SESSION_SECRET` | AES-256 key for encrypting OAuth tokens at rest in Supabase | `/api/auth/*` routes | Runtime (server) | SECRET — generate with `openssl rand -hex 32`. Loss of this key means stored tokens become unrecoverable |

---

## Build-Time vs Runtime

**Build-time (`VITE_*` prefix):**
- Baked into the JavaScript bundle during `vite build`
- Visible to anyone who inspects the client-side JS
- NEVER put secrets in `VITE_*` variables
- Changes require a new deployment/build

**Runtime (no `VITE_*` prefix):**
- Available only in serverless function execution environment
- Never sent to the browser
- Can be changed in Vercel dashboard without redeploying (takes effect on next cold start)

---

## Vercel Environment Configuration

Set every variable in **all three Vercel environments**:
- **Production** — live deployment
- **Preview** — branch/PR deployments
- **Development** — `vercel dev` local development

Use different values per environment where appropriate (e.g., `GOOGLE_REDIRECT_URI` should point to the correct domain for each environment).

---

## .env.example

A `.env.example` file must be committed to the repository with all variable names and no values:

```bash
# Google OAuth2
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback

# Anthropic Claude API
ANTHROPIC_API_KEY=

# Supabase
DATABASE_URL=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_ANON_KEY=

# Session encryption (used to encrypt OAuth tokens at rest)
SESSION_SECRET=

# Frontend (build-time, safe to expose)
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```
