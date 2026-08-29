import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getOrCreateUser, type User } from "@shortlist/data-store";

const COOKIE = "shortlist_session";

function secret(): string {
  return process.env.SESSION_SECRET || "dev-only-change-me";
}

function sign(userId: string): string {
  const mac = createHmac("sha256", secret()).update(userId).digest("hex");
  return `${userId}.${mac}`;
}

function verify(token: string): string | null {
  const i = token.indexOf(".");
  if (i < 0) return null;
  const userId = token.slice(0, i);
  const mac = token.slice(i + 1);
  const expected = createHmac("sha256", secret()).update(userId).digest("hex");
  try {
    if (mac.length !== expected.length) return null;
    if (!timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return null;
    return userId;
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<User | null> {
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  if (!raw) return null;
  const userId = verify(raw);
  if (!userId) return null;
  const { loadStore } = await import("@shortlist/data-store");
  const user = loadStore().users.find((u) => u.id === userId);
  return user ?? null;
}

export async function setSession(email: string): Promise<User> {
  const user = getOrCreateUser(email);
  const jar = await cookies();
  jar.set(COOKIE, sign(user.id), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return user;
}

export async function clearSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE);
}
