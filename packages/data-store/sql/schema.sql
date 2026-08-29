-- Shortlist data-store schema (Neon / Postgres compatible)
-- Apply manually or via ensureSchema() on first PG connection.

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clicks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users (id),
  offer_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS clicks_user_id_idx ON clicks (user_id);

CREATE TABLE IF NOT EXISTS ledger (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users (id),
  offer_id TEXT NOT NULL,
  click_id TEXT NOT NULL REFERENCES clicks (id),
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'payable', 'paid')),
  amount_cents INTEGER NOT NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ledger_user_id_idx ON ledger (user_id);

CREATE TABLE IF NOT EXISTS featured (
  category TEXT PRIMARY KEY,
  offer_id TEXT NOT NULL
);
