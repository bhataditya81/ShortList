import { getOffer, isCategoryId } from "@shortlist/catalog";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
  const key = process.env.STRIPE_SECRET_KEY;
  const price = process.env.STRIPE_PRICE_FEATURED;
  if (!key || !price) {
    return NextResponse.json(
      { error: "Stripe not configured. Use FEATURED_ADMIN_SECRET form on /featured for local slots." },
      { status: 501 },
    );
  }
  const body = (await req.json()) as { category?: string; offerId?: string };
  if (!body.category || !isCategoryId(body.category) || !body.offerId || !getOffer(body.offerId)) {
    return NextResponse.json({ error: "category and offerId required" }, { status: 400 });
  }
  const offer = getOffer(body.offerId);
  if (!offer || offer.category !== body.category) {
    return NextResponse.json({ error: "offer must belong to category" }, { status: 400 });
  }
  const stripe = new Stripe(key);
  const origin = new URL(req.url).origin;
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price, quantity: 1 }],
    success_url: `${origin}/featured?ok=stripe`,
    cancel_url: `${origin}/featured`,
    metadata: { category: body.category, offerId: body.offerId },
  });
  return NextResponse.json({ url: session.url });
}
