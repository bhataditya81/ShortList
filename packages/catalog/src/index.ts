import { OFFERS } from "./offers.js";
import { CATEGORIES, type CategoryId, type Offer } from "./types.js";

export * from "./types.js";
export { OFFERS } from "./offers.js";

function readAffiliateEnv(offerId: string): string | undefined {
  // Read at call time so Next.js / Vercel env updates apply without stale module snapshot.
  const map: Record<string, string | undefined> = {
    railway: process.env.RAILWAY_AFFILIATE_URL,
    digitalocean: process.env.DIGITALOCEAN_AFFILIATE_URL,
    pinecone: process.env.PINECONE_AFFILIATE_URL,
  };
  const raw = map[offerId]?.trim();
  return raw || undefined;
}

const HOST_ALLOWLIST: Record<string, string[]> = {
  railway: ["railway.com", "www.railway.com", "railway.app", "www.railway.app"],
  digitalocean: ["digitalocean.com", "www.digitalocean.com", "cloud.digitalocean.com"],
  pinecone: ["pinecone.io", "www.pinecone.io", "app.pinecone.io", "partnerstack.com"],
};

function isAllowedAffiliateUrl(offerId: string, raw: string): boolean {
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") return false;
    const hosts = HOST_ALLOWLIST[offerId];
    if (!hosts) return false;
    return hosts.some((h) => url.hostname === h || url.hostname.endsWith(`.${h}`));
  } catch {
    return false;
  }
}

export function withAffiliateOverlay(offers: Offer[] = OFFERS): Offer[] {
  return offers.map((offer) => {
    const fromEnv = readAffiliateEnv(offer.id);
    if (!fromEnv) return offer;
    if (!isAllowedAffiliateUrl(offer.id, fromEnv)) {
      console.warn(`[shortlist] Ignoring invalid RAILWAY/affiliate URL for ${offer.id}`);
      return offer;
    }
    return { ...offer, affiliateUrl: fromEnv, hasPublicCpa: true };
  });
}

export function offersByCategory(category: CategoryId, offers = withAffiliateOverlay()): Offer[] {
  return offers.filter((o) => o.category === category);
}

export function getOffer(id: string, offers = withAffiliateOverlay()): Offer | undefined {
  return offers.find((o) => o.id === id);
}

export function isCategoryId(value: string): value is CategoryId {
  return (CATEGORIES as readonly string[]).includes(value);
}

export function featuredNeverOutranksOrganic(): true {
  return true;
}
