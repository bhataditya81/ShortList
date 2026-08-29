import {
  CATEGORY_LABELS,
  getOffer,
  isCategoryId,
  offersByCategory,
  type CategoryId,
  type Offer,
} from "@shortlist/catalog";

export type StackSignals = {
  language?: string;
  packages?: string[];
  region?: string;
  budgetUsdMo?: number;
};

export {
  mergeStackSignalsFromPackageJson,
  parsePackageJsonForStackSignals,
  resolvePackageJsonPath,
  type ParsedPackageJsonSignals,
} from "./parse-package-json.js";

export type RankedOffer = Offer & { organicScore: number; reasons: string[] };

export type SearchResult = {
  category: CategoryId;
  categoryLabel: string;
  organic: RankedOffer[];
  featured: (RankedOffer & { label: "Featured" }) | null;
  rule: "Featured never outranks a better organic fit. Featured is labeled and listed after organic.";
};

function norm(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9+]/g, "");
}

export function organicScore(offer: Offer, stack: StackSignals = {}): { score: number; reasons: string[] } {
  let score = 10;
  const reasons: string[] = ["baseline comparison slot"];

  if (stack.language) {
    const lang = norm(stack.language);
    const hit = offer.stackTags.some((t) => norm(t) === lang || norm(t).includes(lang));
    if (hit) {
      score += 25;
      reasons.push(`language fit (${stack.language})`);
    } else {
      score -= 8;
      reasons.push("language mismatch");
    }
  }

  const pkgs = (stack.packages ?? []).map(norm);
  if (pkgs.length) {
    const tagSet = new Set(offer.stackTags.map(norm));
    const matches = pkgs.filter((p) => tagSet.has(p) || [...tagSet].some((t) => p.includes(t) || t.includes(p)));
    if (matches.length) {
      score += Math.min(20, matches.length * 6);
      reasons.push(`stack packages: ${matches.slice(0, 4).join(", ")}`);
    }
  }

  if (stack.region) {
    const r = norm(stack.region);
    if (offer.regions.some((reg) => norm(reg) === r || norm(reg) === "global")) {
      score += 8;
      reasons.push(`region ${stack.region}`);
    }
  }

  if (stack.budgetUsdMo != null) {
    const pricing = offer.pricing.toLowerCase();
    if (stack.budgetUsdMo < 25 && /free/.test(pricing)) {
      score += 12;
      reasons.push("fits a low budget (free tier)");
    }
    if (stack.budgetUsdMo < 50 && /expensive|enterprise-leaning/.test(pricing)) {
      score -= 15;
      reasons.push("likely over budget");
    }
  }

  if (/high/.test(offer.lockIn.toLowerCase())) {
    score -= 6;
    reasons.push("higher lock-in");
  } else if (/low/.test(offer.lockIn.toLowerCase())) {
    score += 4;
    reasons.push("lower lock-in");
  }

  return { score, reasons };
}

export function searchTools(input: {
  category: string;
  stack_signals?: StackSignals;
  featuredOfferId?: string | null;
}): SearchResult {
  if (!isCategoryId(input.category)) {
    throw new Error(`Unknown category: ${input.category}`);
  }
  const category = input.category;
  const stack = input.stack_signals ?? {};
  const ranked: RankedOffer[] = offersByCategory(category)
    .map((offer) => {
      const { score, reasons } = organicScore(offer, stack);
      return { ...offer, organicScore: score, reasons };
    })
    .sort((a, b) => b.organicScore - a.organicScore);

  const fid = input.featuredOfferId;
  const organic = (fid ? ranked.filter((o) => o.id !== fid) : ranked).slice(0, 3);

  let featured: SearchResult["featured"] = null;
  if (fid) {
    const offer = getOffer(fid);
    if (offer && offer.category === category) {
      const { score, reasons } = organicScore(offer, stack);
      featured = {
        ...offer,
        organicScore: score,
        reasons: [...reasons, "paid Featured slot — labeled, not used to reorder organic"],
        label: "Featured",
      };
    }
  }

  return {
    category,
    categoryLabel: CATEGORY_LABELS[category],
    organic,
    featured,
    rule: "Featured never outranks a better organic fit. Featured is labeled and listed after organic.",
  };
}
