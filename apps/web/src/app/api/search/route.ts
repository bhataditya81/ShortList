import { NextResponse } from "next/server";
import { isCategoryId } from "@shortlist/catalog";
import { getFeaturedOfferId } from "@shortlist/data-store";
import { searchTools } from "@shortlist/ranker";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const category = url.searchParams.get("category") || "";
  if (!isCategoryId(category)) {
    return NextResponse.json({ error: "invalid category" }, { status: 400 });
  }
  const packages = url.searchParams.get("packages");
  const result = searchTools({
    category,
    stack_signals: {
      language: url.searchParams.get("language") || undefined,
      packages: packages ? packages.split(",").map((s) => s.trim()) : undefined,
      region: url.searchParams.get("region") || undefined,
      budgetUsdMo: url.searchParams.get("budget")
        ? Number(url.searchParams.get("budget"))
        : undefined,
    },
    featuredOfferId: getFeaturedOfferId(category) ?? null,
  });
  return NextResponse.json(result);
}
