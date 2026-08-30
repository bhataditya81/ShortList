import { NextResponse } from "next/server";
import { getOffer } from "@shortlist/catalog";

/** Lightweight readiness probe for Vercel / local POC. */
export async function GET() {
  const railwayConfigured = Boolean(process.env.RAILWAY_AFFILIATE_URL?.trim());
  const authConfigured = Boolean(
    process.env.AUTH_SECRET?.trim() &&
      process.env.AUTH_SECRET.length >= 16 &&
      !process.env.AUTH_SECRET.includes("generate-with-openssl"),
  );
  const adminConfigured = Boolean(
    process.env.FEATURED_ADMIN_SECRET?.trim() &&
      process.env.FEATURED_ADMIN_SECRET !== "dev-featured",
  );
  const databaseConfigured = Boolean(process.env.DATABASE_URL?.trim());
  const onVercel = process.env.VERCEL === "1";
  const railwayOffer = getOffer("railway");

  const ok =
    authConfigured &&
    adminConfigured &&
    (!onVercel || databaseConfigured) &&
    railwayConfigured &&
    Boolean(railwayOffer?.affiliateUrl);

  return NextResponse.json(
    {
      ok,
      stage: "poc",
      checks: {
        AUTH_SECRET: authConfigured,
        FEATURED_ADMIN_SECRET: adminConfigured,
        DATABASE_URL: databaseConfigured,
        RAILWAY_AFFILIATE_URL: railwayConfigured && Boolean(railwayOffer?.affiliateUrl),
        vercelRequiresDatabase: onVercel,
      },
      note: ok
        ? "POC config looks ready (cashback still off; Railway tracked signup only)."
        : "Missing required POC env — see docs/P0-playbook.md and .env.example.",
    },
    { status: ok ? 200 : 503 },
  );
}
