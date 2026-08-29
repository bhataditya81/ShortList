import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
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

export function defaultStorePath(): string {
  if (process.env.SHORTLIST_DATA_PATH) return process.env.SHORTLIST_DATA_PATH;
  const cwd = process.cwd();
  if (
    cwd.includes("apps/web") ||
    cwd.includes("apps\\web") ||
    cwd.includes("apps/mcp") ||
    cwd.includes("apps\\mcp")
  ) {
    return join(cwd, "..", "..", "data", "shortlist-store.json");
  }
  return join(cwd, "data", "shortlist-store.json");
}

const empty = (): StoreFile => ({
  users: [],
  clicks: [],
  ledger: [],
  featured: {},
});

export function loadStore(path = defaultStorePath()): StoreFile {
  try {
    return JSON.parse(readFileSync(path, "utf8")) as StoreFile;
  } catch {
    return empty();
  }
}

export function saveStore(store: StoreFile, path = defaultStorePath()): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(store, null, 2), "utf8");
}

export function getOrCreateUser(email: string, path = defaultStorePath()): User {
  const store = loadStore(path);
  const normalized = email.trim().toLowerCase();
  let user = store.users.find((u) => u.email === normalized);
  if (!user) {
    user = { id: id("usr"), email: normalized, createdAt: new Date().toISOString() };
    store.users.push(user);
    saveStore(store, path);
  }
  return user;
}

export function getUserById(userId: string, path = defaultStorePath()): User | null {
  return loadStore(path).users.find((u) => u.id === userId) ?? null;
}

export function recordClick(userId: string, offerId: string, path = defaultStorePath()): Click {
  const store = loadStore(path);
  const click: Click = {
    id: id("clk"),
    userId,
    offerId,
    createdAt: new Date().toISOString(),
  };
  store.clicks.push(click);
  saveStore(store, path);
  return click;
}

export function confirmConversion(opts: {
  clickId: string;
  amountCents: number;
  note?: string;
  path?: string;
}): LedgerEntry | null {
  const path = opts.path ?? defaultStorePath();
  const store = loadStore(path);
  const click = store.clicks.find((c) => c.id === opts.clickId);
  if (!click) return null;
  const entry: LedgerEntry = {
    id: id("led"),
    userId: click.userId,
    offerId: click.offerId,
    clickId: click.id,
    status: "confirmed",
    amountCents: opts.amountCents,
    note: opts.note ?? "Imported from affiliate dashboard (stub)",
    createdAt: new Date().toISOString(),
  };
  store.ledger.push(entry);
  saveStore(store, path);
  return entry;
}

export function userBalanceCents(
  userId: string,
  path = defaultStorePath(),
): {
  pending: number;
  confirmed: number;
  payable: number;
  paid: number;
} {
  const store = loadStore(path);
  const rows = store.ledger.filter((l) => l.userId === userId);
  const sum = (status: LedgerStatus) =>
    rows.filter((r) => r.status === status).reduce((a, r) => a + r.amountCents, 0);
  return {
    pending: sum("pending"),
    confirmed: sum("confirmed"),
    payable: sum("payable"),
    paid: sum("paid"),
  };
}

export function markPayableIfEligible(userId: string, path = defaultStorePath()): void {
  const store = loadStore(path);
  const confirmed = store.ledger.filter((l) => l.userId === userId && l.status === "confirmed");
  const total = confirmed.reduce((a, r) => a + r.amountCents, 0);
  if (total < CASH_OUT_MIN_CENTS) return;
  for (const row of confirmed) row.status = "payable";
  saveStore(store, path);
}

export function setFeatured(category: CategoryId, offerId: string, path = defaultStorePath()): void {
  const store = loadStore(path);
  store.featured[category] = offerId;
  saveStore(store, path);
}

export function getFeaturedOfferId(category: CategoryId, path = defaultStorePath()): string | undefined {
  return loadStore(path).featured[category];
}
