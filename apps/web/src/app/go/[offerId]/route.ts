import { getOffer } from "@shortlist/catalog";
import { recordClick } from "@shortlist/data-store";
import { NextResponse } from "next/server";
import { assertSafeAffiliateUrl, safeInternalPath } from "@/lib/poc-security";
import { getSessionUser } from "@/lib/session";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ offerId: string }> },
) {
  const { offerId } = await params;
  const user = await getSessionUser();
  if (!user) {
    const next = safeInternalPath(`/go/${offerId}`);
    return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(next)}`, req.url));
  }

  const offer = getOffer(offerId);
  if (!offer) {
    return NextResponse.json({ error: "Unknown offer" }, { status: 404 });
  }

  // Tracked path requires a validated affiliate URL (Railway POC: RAILWAY_AFFILIATE_URL).
  if (!offer.affiliateUrl) {
    return NextResponse.json(
      {
        error: "No tracked affiliate URL configured for this offer",
        hint:
          offerId === "railway"
            ? "Set RAILWAY_AFFILIATE_URL to your https://railway.com referral link"
            : "Set the corresponding *_AFFILIATE_URL env var",
      },
      { status: 503 },
    );
  }

  try {
    assertSafeAffiliateUrl(offer.id, offer.affiliateUrl);
  } catch {
    return NextResponse.json({ error: "Affiliate URL failed allowlist" }, { status: 503 });
  }

  const click = await recordClick(user.id, offer.id);
  return NextResponse.redirect(new URL(`/r/${click.id}`, req.url));
}
