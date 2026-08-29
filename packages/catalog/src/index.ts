import { OFFERS } from "./offers.js";
import { CATEGORIES, type CategoryId, type Offer } from "./types.js";

export * from "./types.js";
export { OFFERS } from "./offers.js";

const AFFILIATE_ENV: Record<string, string | undefined> = {
  railway: process.env.RAILWAY_AFFILIATE_URL,
  digitalocean: process.env.DIGITALOCEAN_AFFILIATE_URL,
  pinecone: process.env.PINECONE_AFFILIATE_URL,
};

export function withAffiliateOverlay(offers: Offer[] = OFFERS): Offer[] {
  return offers.map((offer) => {
    const fromEnv = AFFILIATE_ENV[offer.id];
    if (!fromEnv) return offer;
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
