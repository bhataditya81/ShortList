import { getOffer } from "@shortlist/catalog";
import { recordClick } from "@shortlist/data-store";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ offerId: string }> },
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login?next=/go/" + (await params).offerId, _req.url));
  }
  const { offerId } = await params;
  const offer = getOffer(offerId);
  if (!offer) {
    return NextResponse.json({ error: "Unknown offer" }, { status: 404 });
  }
  const click = await recordClick(user.id, offer.id);
  return NextResponse.redirect(new URL(`/r/${click.id}`, _req.url));
}
