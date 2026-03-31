# CON-CORE Database Schema

All tables live in Supabase PostgreSQL. All timestamps are stored in UTC. All tables include soft delete via `deleted_at` column.

---

## email_sources

Unique senders extracted from Gmail analysis.

```sql
CREATE TABLE email_sources (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_address  TEXT UNIQUE NOT NULL,
  sender_name     TEXT,
  message_count   INTEGER NOT NULL DEFAULT 0,
  category_breakdown JSONB,
    -- Example: {"promo": 42, "transactional": 7, "work": 3, "personal": 2, "newsletter": 15, "system": 5}
  last_analyzed   TIMESTAMPTZ,
  unsubscribe_vector BOOLEAN DEFAULT FALSE,
    -- TRUE if an unsubscribe mechanism was detected
  dossier_summary TEXT,
    -- Claude-generated plain-text summary of this sender
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);
```

---

## schedule_templates

Reusable day templates for batch calendar event creation.

```sql
CREATE TABLE schedule_templates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  day_type    TEXT NOT NULL CHECK (day_type IN ('weekday', 'weekend')),
  time_blocks JSONB NOT NULL DEFAULT '[]',
    -- Array of objects: [
    --   {
    --     "start_time": "09:00",
    --     "end_time": "10:00",
    --     "label": "Deep Work",
    --     "calendar_id": "primary"
    --   }
    -- ]
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ
);
```

> **Phase 3 implementation note:** Templates are currently stored in localStorage for rapid prototyping. Supabase migration planned for a future phase.

---

## bookmark_vaults

Named containers for imported bookmark sets.

```sql
CREATE TABLE bookmark_vaults (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_name  TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ
);
```

---

## bookmarks

Individual bookmarks belonging to a vault.

```sql
CREATE TABLE bookmarks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_id      UUID NOT NULL REFERENCES bookmark_vaults(id),
  url           TEXT NOT NULL,
  title         TEXT,
  status        TEXT NOT NULL DEFAULT 'alive' CHECK (status IN ('alive', 'dead', 'dupe')),
  dupe_count    INTEGER NOT NULL DEFAULT 0,
  last_checked  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ
);

CREATE INDEX idx_bookmarks_vault_id ON bookmarks(vault_id);
CREATE INDEX idx_bookmarks_status ON bookmarks(status);
```

---

## subscriptions

Detected recurring subscriptions from receipt analysis.

```sql
CREATE TABLE subscriptions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name      TEXT NOT NULL,
  monthly_cost      DECIMAL(10, 2) NOT NULL DEFAULT 0,
  category          TEXT,
  detected_since    TIMESTAMPTZ,
  last_charge       TIMESTAMPTZ,
  lifetime_spend    DECIMAL(10, 2) NOT NULL DEFAULT 0,
  usage_status      TEXT NOT NULL DEFAULT 'active' CHECK (usage_status IN ('active', 'forgotten')),
  cancellation_url  TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ
);
```

> **Phase 3 implementation note:** Subscription detection results are currently ephemeral (held in React state from Claude API responses). Supabase persistence planned for a future phase.

---

## task_queue_items

Simple ordered task list for the command-line-style task queue.

```sql
CREATE TABLE task_queue_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text        TEXT NOT NULL,
  position    INTEGER NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ
);

CREATE INDEX idx_task_queue_position ON task_queue_items(position);
```

---

## contact_records

Contacts imported from various sources for deduplication.

```sql
CREATE TABLE contact_records (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT,
  email               TEXT,
  phone               TEXT,
  source              TEXT,
    -- e.g., "gmail", "phone", "manual"
  duplicate_group_id  UUID,
    -- NULL if no duplicates detected; shared UUID groups duplicates together
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at          TIMESTAMPTZ
);

CREATE INDEX idx_contact_records_dupe_group ON contact_records(duplicate_group_id);
```

---

## auth_tokens

Encrypted Google OAuth2 tokens. Single row for single-user app.

```sql
CREATE TABLE auth_tokens (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  access_token_encrypted    TEXT NOT NULL,
  refresh_token_encrypted   TEXT NOT NULL,
  token_expiry              TIMESTAMPTZ NOT NULL,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at                TIMESTAMPTZ
);
```

---

## Important Notes

- **Password audit results are NEVER stored in the database.** They exist only in React component state during the user's session and are discarded on navigation or page close. This is a deliberate security decision.
- All `JSONB` columns should be validated at the application layer before insert.
- `updated_at` columns should be maintained via application code or a Supabase trigger:

```sql
-- Optional: auto-update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to each table, e.g.:
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON email_sources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```
