import { isCategoryId } from "@shortlist/catalog";
import { setFeatured } from "@shortlist/data-store";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const key = process.env.STRIPE_SECRET_KEY;
  const whsec = process.env.STRIPE_WEBHOOK_SECRET;
  if (!key || !whsec) {
    return NextResponse.json({ error: "webhook not configured" }, { status: 501 });
  }
  const stripe = new Stripe(key);
  const sig = req.headers.get("stripe-signature");
  const raw = await req.text();
  if (!sig) return NextResponse.json({ error: "no signature" }, { status: 400 });
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, whsec);
  } catch {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const category = session.metadata?.category;
    const offerId = session.metadata?.offerId;
    if (category && isCategoryId(category) && offerId) {
      setFeatured(category, offerId);
    }
  }
  return NextResponse.json({ received: true });
}
