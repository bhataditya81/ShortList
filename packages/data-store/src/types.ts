import { randomUUID } from "node:crypto";
import type { CategoryId } from "@shortlist/catalog";

export const CASH_OUT_MIN_CENTS = 2500;

export type LedgerStatus = "pending" | "confirmed" | "payable" | "paid";

export type User = { id: string; email: string; createdAt: string };
export type Click = {
  id: string;
  userId: string;
  offerId: string;
  createdAt: string;
};
export type LedgerEntry = {
  id: string;
  userId: string;
  offerId: string;
  clickId: string;
  status: LedgerStatus;
  amountCents: number;
  note: string;
  createdAt: string;
};
export type StoreFile = {
  users: User[];
  clicks: Click[];
  ledger: LedgerEntry[];
  featured: Partial<Record<CategoryId, string>>;
};

export function id(prefix: string): string {
  return `${prefix}_${randomUUID().replace(/-/g, "")}`;
}
