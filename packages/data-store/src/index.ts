export {
  CASH_OUT_MIN_CENTS,
  type Click,
  type LedgerEntry,
  type LedgerStatus,
  type StoreFile,
  type User,
} from "./types.js";

import * as json from "./json-store.js";
import * as pg from "./postgres-store.js";
import type { CategoryId } from "@shortlist/catalog";
import type { Click, LedgerEntry, StoreFile, User } from "./types.js";

function usePostgres(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function defaultStorePath(): string {
  return json.defaultStorePath();
}

export async function loadStore(path?: string): Promise<StoreFile> {
  if (usePostgres()) return pg.loadStore();
  return json.loadStore(path);
}

export async function getOrCreateUser(email: string, path?: string): Promise<User> {
  if (usePostgres()) return pg.getOrCreateUser(email);
  return json.getOrCreateUser(email, path);
}

export async function getUserById(userId: string, path?: string): Promise<User | null> {
  if (usePostgres()) return pg.getUserById(userId);
  return json.getUserById(userId, path);
}

export async function recordClick(userId: string, offerId: string, path?: string): Promise<Click> {
  if (usePostgres()) return pg.recordClick(userId, offerId);
  return json.recordClick(userId, offerId, path);
}

export async function confirmConversion(opts: {
  clickId: string;
  amountCents: number;
  note?: string;
  path?: string;
}): Promise<LedgerEntry | null> {
  if (usePostgres()) return pg.confirmConversion(opts);
  return json.confirmConversion(opts);
}

export async function userBalanceCents(
  userId: string,
  path?: string,
): Promise<{ pending: number; confirmed: number; payable: number; paid: number }> {
  if (usePostgres()) return pg.userBalanceCents(userId);
  return json.userBalanceCents(userId, path);
}

export async function markPayableIfEligible(userId: string, path?: string): Promise<void> {
  if (usePostgres()) return pg.markPayableIfEligible(userId);
  return json.markPayableIfEligible(userId, path);
}

export async function setFeatured(category: CategoryId, offerId: string, path?: string): Promise<void> {
  if (usePostgres()) return pg.setFeatured(category, offerId);
  return json.setFeatured(category, offerId, path);
}

export async function getFeaturedOfferId(category: CategoryId, path?: string): Promise<string | undefined> {
  if (usePostgres()) return pg.getFeaturedOfferId(category);
  return json.getFeaturedOfferId(category, path);
}

/** @deprecated Use loadStore — kept for callers that need sync JSON-only access. */
export function saveStore(store: StoreFile, path?: string): void {
  if (usePostgres()) {
    throw new Error("saveStore is not supported when DATABASE_URL is set; use the typed APIs.");
  }
  json.saveStore(store, path);
}

export { ensureSchema } from "./postgres-store.js";
