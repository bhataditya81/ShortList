import { getOffer } from "@shortlist/catalog";
import { loadStore } from "@shortlist/data-store";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ clickId: string }> },
) {
  const { clickId } = await params;
  const store = loadStore();
  const click = store.clicks.find((c) => c.id === clickId);
  if (!click) {
    return NextResponse.json({ error: "Unknown click" }, { status: 404 });
  }
  const offer = getOffer(click.offerId);
  if (!offer) {
    return NextResponse.json({ error: "Unknown offer" }, { status: 404 });
  }
  const dest = offer.affiliateUrl || offer.url;
  const url = new URL(dest);
  url.searchParams.set("subId", click.userId);
  url.searchParams.set("clickid", click.id);
  url.searchParams.set("offer", offer.id);
  return NextResponse.redirect(url.toString(), 302);
}
