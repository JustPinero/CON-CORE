# CON-CORE

**Consolidated Operations Core** — A retro sci-fi CRT terminal for batch life-admin operations.

CON-CORE consolidates email triage, calendar scheduling, bookmark management, subscription tracking, password auditing, contact dedup, file recon, and task management into a single green-on-black Fallout-terminal interface optimized for bulk operations.

## Stations

| Station | Key | Description |
|---|---|---|
| **COMMS** | F1 | Gmail sender analysis, batch delete/archive, unsubscribe |
| **SCHEDULE** | F2 | Calendar template CRUD, deploy schedules, conflict detection |
| **RESEARCH** | F3 | Chrome bookmark import, AI categorization, dead link scan, dedup |
| **SECURITY** | F4 | Password manager CSV audit (1Password/Bitwarden/LastPass) |
| **SUBSCRIPTIONS** | F5 | Receipt scanning, cost tracking, forgotten subscription detection |
| **CONTACTS** | F6 | Contact CSV import, duplicate detection, merge interface |
| **FILE RECON** | F7 | File analysis — largest, oldest, duplicates, storage summary |
| **TASK QUEUE** | F8 | Simple FIFO task queue with persistence |
| **TERMINAL** | F9 | CLI with full command parity for all stations |

## Stack

- **Frontend:** React 19 + Vite 8 + TypeScript (strict mode)
- **Backend:** Vercel Serverless Functions
- **Database:** Supabase PostgreSQL
- **AI:** Claude API (claude-sonnet-4-20250514) via server-side proxy
- **Auth:** Google OAuth2 (Gmail + Calendar + Contacts scopes)
- **Testing:** Vitest + React Testing Library

## Setup

### Prerequisites

- Node.js 20+
- A Google Cloud project with OAuth2 credentials (Gmail + Calendar APIs enabled)
- A Supabase project (free tier)
- An Anthropic API key

### Installation

```bash
git clone https://github.com/coqui-labs/con-core.git
cd con-core
npm install
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in all values:

```bash
cp .env.example .env.local
```

Required variables:

| Variable | Description |
|---|---|
| `GOOGLE_CLIENT_ID` | Google OAuth2 client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth2 client secret |
| `GOOGLE_REDIRECT_URI` | OAuth callback URL (e.g., `http://localhost:5173/api/auth/callback`) |
| `ANTHROPIC_API_KEY` | Claude API key |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |
| `SESSION_SECRET` | 32+ character encryption key for OAuth token storage |
| `VITE_SUPABASE_URL` | Supabase URL (build-time, safe to expose) |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key (build-time, safe to expose) |

### Supabase Setup

Run the SQL migrations in `references/schema.md` to create the required tables:
- `auth_tokens` — encrypted OAuth token storage
- `email_sources` — cached sender analysis results

### Development

```bash
npm run dev        # Start Vite dev server
npm run test       # Run tests
npm run lint       # Run ESLint
npm run format     # Run Prettier
npm run validate   # Run full validation (same as CI)
```

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Set all environment variables in the Vercel dashboard for Production, Preview, and Development environments.

## Architecture

- `src/components/` — Reusable CRT-styled components (Shell, Rolodex, PieChart, etc.)
- `src/stations/` — Station-specific UI and terminal commands
- `src/services/` — Client-side API wrappers and business logic
- `src/theme/` — CRT design system (CSS + TypeScript tokens)
- `api/` — Vercel serverless functions (auth, gmail, calendar, claude)
- `references/` — Architecture docs, schema, API contracts, design system spec

## CRT Aesthetic

The entire app maintains a retro CRT terminal look:
- Green-on-black color palette (`#33ff33` primary)
- Scanline overlay via CSS
- Courier New monospace typography
- No rounded corners, no gradients, no smooth transitions
- ASCII progress bars instead of spinners
- Boot sequence animation on load

## Security

- Google OAuth tokens encrypted with AES-256-GCM before Supabase storage
- CSRF protection on OAuth flow (state parameter + HttpOnly cookie)
- Claude API key server-side only (never in client bundle)
- Password audit data held in React state only — NEVER persisted
- SSRF protection on unsubscribe URL execution

## License

MIT — see [LICENSE](LICENSE)

---

Built by [Coqui Labs](https://github.com/coqui-labs)
