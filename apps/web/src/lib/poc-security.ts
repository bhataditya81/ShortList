import { timingSafeEqual } from "node:crypto";

/** True on Vercel or when NODE_ENV=production. */
export function isDeployedRuntime(): boolean {
  return process.env.VERCEL === "1" || process.env.NODE_ENV === "production";
}

export function requireAuthSecret(): string {
  const secret = process.env.AUTH_SECRET?.trim();
  if (!secret || secret.length < 16 || secret.includes("generate-with-openssl")) {
    throw new Error(
      "AUTH_SECRET must be set to a strong random value (openssl rand -base64 32). See .env.example.",
    );
  }
  return secret;
}

/** No hardcoded defaults — missing secret fails closed. */
export function requireAdminSecret(): string {
  const secret = process.env.FEATURED_ADMIN_SECRET?.trim();
  if (!secret || secret === "dev-featured") {
    throw new Error(
      "FEATURED_ADMIN_SECRET must be set to a non-default value. Do not use 'dev-featured'.",
    );
  }
  return secret;
}

export function adminSecretsEqual(provided: string | null | undefined): boolean {
  try {
    const expected = requireAdminSecret();
    if (!provided) return false;
    const a = Buffer.from(provided);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/** Block open redirects: only same-origin relative paths, not //evil.com */
export function safeInternalPath(next: string | null | undefined, fallback = "/account"): string {
  if (!next) return fallback;
  const trimmed = next.trim();
  if (!trimmed.startsWith("/")) return fallback;
  if (trimmed.startsWith("//")) return fallback;
  if (trimmed.includes("://")) return fallback;
  if (trimmed.includes("\\")) return fallback;
  return trimmed;
}

const AFFILIATE_HOST_ALLOWLIST: Record<string, string[]> = {
  railway: ["railway.com", "www.railway.com", "railway.app", "www.railway.app"],
  digitalocean: ["digitalocean.com", "www.digitalocean.com", "cloud.digitalocean.com"],
  pinecone: ["pinecone.io", "www.pinecone.io", "app.pinecone.io", "partnerstack.com", "www.partnerstack.com"],
};

export function assertSafeAffiliateUrl(offerId: string, raw: string): string {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(`Invalid affiliate URL for ${offerId}`);
  }
  if (url.protocol !== "https:") {
    throw new Error(`Affiliate URL for ${offerId} must be https`);
  }
  const allowed = AFFILIATE_HOST_ALLOWLIST[offerId];
  if (allowed && !allowed.some((h) => url.hostname === h || url.hostname.endsWith(`.${h}`))) {
    // Allow partnerstack subdomains for pinecone
    if (offerId === "pinecone" && url.hostname.endsWith("partnerstack.com")) {
      return url.toString();
    }
    throw new Error(`Affiliate host not allowlisted for ${offerId}: ${url.hostname}`);
  }
  return url.toString();
}

/** POC: if SHORTLIST_ALLOWED_EMAILS is set, only those emails may sign in. */
export function emailAllowedForPoc(email: string): boolean {
  const raw = process.env.SHORTLIST_ALLOWED_EMAILS?.trim();
  if (!raw) return true; // unset = open (local demo); set on Vercel for private beta
  const allowed = raw.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  return allowed.includes(email.trim().toLowerCase());
}
