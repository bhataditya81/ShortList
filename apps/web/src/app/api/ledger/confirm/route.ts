import { NextResponse } from "next/server";
import { confirmConversion, markPayableIfEligible } from "@shortlist/data-store";
import { adminSecretsEqual } from "@/lib/poc-security";

/** Stub: paste click id + amount after you see a conversion in Railway/CJ/PartnerStack. */
export async function POST(req: Request) {
  const secret = req.headers.get("x-admin-secret");
  if (!adminSecretsEqual(secret)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = (await req.json()) as { clickId?: string; amountCents?: number; note?: string };
  if (!body.clickId || typeof body.amountCents !== "number") {
    return NextResponse.json({ error: "clickId and amountCents required" }, { status: 400 });
  }
  if (!Number.isFinite(body.amountCents) || body.amountCents <= 0) {
    return NextResponse.json({ error: "amountCents must be positive" }, { status: 400 });
  }
  const userShare = Math.round(body.amountCents * 0.7);
  if (userShare <= 0) {
    return NextResponse.json({ error: "amountCents too small after 70% split" }, { status: 400 });
  }
  let entry;
  try {
    entry = await confirmConversion({
      clickId: body.clickId,
      amountCents: userShare,
      note: body.note ?? "70% user share of affiliate commission (platform keeps 30%)",
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "confirm failed" },
      { status: 400 },
    );
  }
  if (!entry) {
    return NextResponse.json({ error: "click not found" }, { status: 404 });
  }
  await markPayableIfEligible(entry.userId);
  return NextResponse.json({ entry, platformShareCents: body.amountCents - userShare });
}
