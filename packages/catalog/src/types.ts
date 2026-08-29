export const CATEGORIES = [
  "auth",
  "db",
  "hosting",
  "email",
  "payments",
  "observability",
  "errors",
  "feature-flags",
  "queues",
  "storage",
  "llm-router",
  "vector",
] as const;

export type CategoryId = (typeof CATEGORIES)[number];

export type Network =
  | "none"
  | "railway"
  | "cj"
  | "partnerstack"
  | "dub"
  | "in-house";

export type Offer = {
  id: string;
  name: string;
  category: CategoryId;
  url: string;
  pricing: string;
  lockIn: string;
  stackTags: string[];
  regions: string[];
  hasPublicCpa: boolean;
  tosCashbackOk: boolean;
  network: Network;
  signupUrl: string | null;
  affiliateUrl: string | null;
  commissionNotes: string;
};

export const CATEGORY_LABELS: Record<CategoryId, string> = {
  auth: "Auth",
  db: "Database",
  hosting: "Hosting",
  email: "Email",
  payments: "Payments",
  observability: "Observability",
  errors: "Error tracking",
  "feature-flags": "Feature flags",
  queues: "Queues / jobs",
  storage: "Storage",
  "llm-router": "LLM router",
  vector: "Vector DB",
};
