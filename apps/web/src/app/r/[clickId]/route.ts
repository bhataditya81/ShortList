import { getOffer } from "@shortlist/catalog";
import { getClickById } from "@shortlist/data-store";
import { NextResponse } from "next/server";
import { assertSafeAffiliateUrl } from "@/lib/poc-security";
import { getSessionUser } from "@/lib/session";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ clickId: string }> },
) {
  const user = await getSessionUser();
  if (!user) {
    const { clickId } = await params;
    return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(`/r/${clickId}`)}`, req.url));
  }

  const { clickId } = await params;
  if (!/^clk_[a-f0-9]{32}$/i.test(clickId)) {
    return NextResponse.json({ error: "Unknown click" }, { status: 404 });
  }

  const click = await getClickById(clickId);
  if (!click) {
    return NextResponse.json({ error: "Unknown click" }, { status: 404 });
  }
  if (click.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const offer = getOffer(click.offerId);
  if (!offer) {
    return NextResponse.json({ error: "Unknown offer" }, { status: 404 });
  }

  const destRaw = offer.affiliateUrl || offer.url;
  let dest: string;
  try {
    dest = offer.affiliateUrl
      ? assertSafeAffiliateUrl(offer.id, destRaw)
      : (() => {
          const u = new URL(destRaw);
          if (u.protocol !== "https:") throw new Error("https only");
          return u.toString();
        })();
  } catch {
    return NextResponse.json({ error: "Unsafe destination" }, { status: 400 });
  }

  const url = new URL(dest);
  // Opaque click id for vendor attribution — do not leak internal user id.
  url.searchParams.set("clickid", click.id);
  url.searchParams.set("offer", offer.id);
  return NextResponse.redirect(url.toString(), 302);
}
