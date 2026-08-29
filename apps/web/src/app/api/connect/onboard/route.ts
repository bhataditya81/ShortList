import { NextResponse } from "next/server";

/** Stripe Connect Express onboard is stubbed until the platform account is enabled. */
export async function POST() {
  return NextResponse.json(
    {
      error: "Connect Express not enabled",
      cashOutMinUsd: 25,
      next: "Enable Stripe Connect on the platform account, then Account Links for Express KYC.",
    },
    { status: 501 },
  );
}
