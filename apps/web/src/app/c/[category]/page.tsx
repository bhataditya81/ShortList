import Link from "next/link";
import { notFound } from "next/navigation";
import { CATEGORIES, CATEGORY_LABELS, isCategoryId } from "@shortlist/catalog";
import { getFeaturedOfferId } from "@shortlist/data-store";
import { searchTools } from "@shortlist/ranker";
import { OfferCard } from "@/components/OfferCard";

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ language?: string; region?: string; budget?: string }>;
}) {
  const { category } = await params;
  if (!isCategoryId(category)) notFound();
  const q = await searchParams;
  const budget = q.budget ? Number(q.budget) : undefined;
  const result = searchTools({
    category,
    stack_signals: {
      language: q.language,
      region: q.region,
      budgetUsdMo: Number.isFinite(budget) ? budget : undefined,
    },
    featuredOfferId: getFeaturedOfferId(category) ?? null,
  });

  return (
    <>
      <p className="meta">
        <Link href="/">Categories</Link> / {result.categoryLabel}
      </p>
      <h1>{result.categoryLabel}</h1>
      <p className="lede">{result.rule}</p>
      <form method="get" style={{ flexDirection: "row", flexWrap: "wrap", maxWidth: "100%", margin: "1rem 0" }}>
        <input name="language" placeholder="language (e.g. typescript)" defaultValue={q.language} />
        <input name="region" placeholder="region (e.g. eu)" defaultValue={q.region} />
        <input name="budget" placeholder="budget USD/mo" defaultValue={q.budget} />
        <button type="submit">Re-rank organic</button>
      </form>
      <h2>Organic</h2>
      {result.organic.map((offer) => (
        <OfferCard key={offer.id} offer={offer} kind="organic" />
      ))}
      {result.featured ? (
        <>
          <h2>Featured</h2>
          <OfferCard offer={result.featured} kind="featured" />
        </>
      ) : (
        <p className="meta">
          No Featured slot for this category. Vendors can buy one on the{" "}
          <Link href="/featured">Featured</Link> page.
        </p>
      )}
    </>
  );
}

export function generateStaticParams() {
  return CATEGORIES.map((category) => ({ category }));
}
