import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { neon } from "@neondatabase/serverless";
import type { CategoryId } from "@shortlist/catalog";
import {
  CASH_OUT_MIN_CENTS,
  id,
  type Click,
  type LedgerEntry,
  type LedgerStatus,
  type StoreFile,
  type User,
} from "./types.js";

let schemaReady = false;

function sql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return neon(url);
}

function schemaPath(): string {
  return join(dirname(fileURLToPath(import.meta.url)), "..", "sql", "schema.sql");
}

export async function ensureSchema(): Promise<void> {
  if (schemaReady) return;
  const ddl = readFileSync(schemaPath(), "utf8");
  const statements = ddl
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("--"));
  const query = sql();
  for (const statement of statements) {
    await query(statement);
  }
  schemaReady = true;
}

export async function loadStore(): Promise<StoreFile> {
  await ensureSchema();
  const query = sql();
  const [users, clicks, ledger, featured] = await Promise.all([
    query`SELECT id, email, created_at FROM users ORDER BY created_at`,
    query`SELECT id, user_id, offer_id, created_at FROM clicks ORDER BY created_at`,
    query`SELECT id, user_id, offer_id, click_id, status, amount_cents, note, created_at FROM ledger ORDER BY created_at`,
    query`SELECT category, offer_id FROM featured`,
  ]);
  const featuredMap: StoreFile["featured"] = {};
  for (const row of featured) {
    featuredMap[row.category as CategoryId] = row.offer_id;
  }
  return {
    users: users.map((r) => ({
      id: r.id,
      email: r.email,
      createdAt: new Date(r.created_at).toISOString(),
    })),
    clicks: clicks.map((r) => ({
      id: r.id,
      userId: r.user_id,
      offerId: r.offer_id,
      createdAt: new Date(r.created_at).toISOString(),
    })),
    ledger: ledger.map((r) => ({
      id: r.id,
      userId: r.user_id,
      offerId: r.offer_id,
      clickId: r.click_id,
      status: r.status as LedgerStatus,
      amountCents: r.amount_cents,
      note: r.note,
      createdAt: new Date(r.created_at).toISOString(),
    })),
    featured: featuredMap,
  };
}

export async function getOrCreateUser(email: string): Promise<User> {
  await ensureSchema();
  const query = sql();
  const normalized = email.trim().toLowerCase();
  const existing = await query`SELECT id, email, created_at FROM users WHERE email = ${normalized} LIMIT 1`;
  if (existing[0]) {
    return {
      id: existing[0].id,
      email: existing[0].email,
      createdAt: new Date(existing[0].created_at).toISOString(),
    };
  }
  const user: User = {
    id: id("usr"),
    email: normalized,
    createdAt: new Date().toISOString(),
  };
  await query`INSERT INTO users (id, email, created_at) VALUES (${user.id}, ${user.email}, ${user.createdAt})`;
  return user;
}

export async function getUserById(userId: string): Promise<User | null> {
  await ensureSchema();
  const query = sql();
  const rows = await query`SELECT id, email, created_at FROM users WHERE id = ${userId} LIMIT 1`;
  if (!rows[0]) return null;
  return {
    id: rows[0].id,
    email: rows[0].email,
    createdAt: new Date(rows[0].created_at).toISOString(),
  };
}

export async function recordClick(userId: string, offerId: string): Promise<Click> {
  await ensureSchema();
  const query = sql();
  const click: Click = {
    id: id("clk"),
    userId,
    offerId,
    createdAt: new Date().toISOString(),
  };
  await query`INSERT INTO clicks (id, user_id, offer_id, created_at) VALUES (${click.id}, ${click.userId}, ${click.offerId}, ${click.createdAt})`;
  return click;
}

export async function confirmConversion(opts: {
  clickId: string;
  amountCents: number;
  note?: string;
}): Promise<LedgerEntry | null> {
  await ensureSchema();
  const query = sql();
  const clicks = await query`SELECT id, user_id, offer_id FROM clicks WHERE id = ${opts.clickId} LIMIT 1`;
  const click = clicks[0];
  if (!click) return null;
  const entry: LedgerEntry = {
    id: id("led"),
    userId: click.user_id,
    offerId: click.offer_id,
    clickId: click.id,
    status: "confirmed",
    amountCents: opts.amountCents,
    note: opts.note ?? "Imported from affiliate dashboard (stub)",
    createdAt: new Date().toISOString(),
  };
  await query`
    INSERT INTO ledger (id, user_id, offer_id, click_id, status, amount_cents, note, created_at)
    VALUES (${entry.id}, ${entry.userId}, ${entry.offerId}, ${entry.clickId}, ${entry.status}, ${entry.amountCents}, ${entry.note}, ${entry.createdAt})
  `;
  return entry;
}

export async function userBalanceCents(userId: string): Promise<{
  pending: number;
  confirmed: number;
  payable: number;
  paid: number;
}> {
  await ensureSchema();
  const query = sql();
  const rows = await query`
    SELECT status, amount_cents FROM ledger WHERE user_id = ${userId}
  `;
  const sum = (status: LedgerStatus) =>
    rows.filter((r) => r.status === status).reduce((a, r) => a + r.amount_cents, 0);
  return {
    pending: sum("pending"),
    confirmed: sum("confirmed"),
    payable: sum("payable"),
    paid: sum("paid"),
  };
}

export async function markPayableIfEligible(userId: string): Promise<void> {
  await ensureSchema();
  const query = sql();
  const rows = await query`
    SELECT id, amount_cents FROM ledger WHERE user_id = ${userId} AND status = 'confirmed'
  `;
  const total = rows.reduce((a, r) => a + r.amount_cents, 0);
  if (total < CASH_OUT_MIN_CENTS) return;
  for (const row of rows) {
    await query`UPDATE ledger SET status = 'payable' WHERE id = ${row.id}`;
  }
}

export async function setFeatured(category: CategoryId, offerId: string): Promise<void> {
  await ensureSchema();
  const query = sql();
  await query`
    INSERT INTO featured (category, offer_id) VALUES (${category}, ${offerId})
    ON CONFLICT (category) DO UPDATE SET offer_id = EXCLUDED.offer_id
  `;
}

export async function getFeaturedOfferId(category: CategoryId): Promise<string | undefined> {
  await ensureSchema();
  const query = sql();
  const rows = await query`SELECT offer_id FROM featured WHERE category = ${category} LIMIT 1`;
  return rows[0]?.offer_id;
}
