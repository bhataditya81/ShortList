import { CATEGORIES, CATEGORY_LABELS, getOffer, isCategoryId } from "@shortlist/catalog";
import { loadStore, setFeatured } from "@shortlist/data-store";
import { redirect } from "next/navigation";
import { adminSecretsEqual } from "@/lib/poc-security";

async function adminFeatured(formData: FormData) {
  "use server";
  const secret = String(formData.get("secret") || "");
  if (!adminSecretsEqual(secret)) {
    redirect("/featured?err=secret");
  }
  const category = String(formData.get("category") || "");
  const offerId = String(formData.get("offerId") || "");
  if (!isCategoryId(category) || !getOffer(offerId)) {
    redirect("/featured?err=offer");
  }
  const offer = getOffer(offerId);
  if (!offer || offer.category !== category) {
    redirect("/featured?err=mismatch");
  }
  await setFeatured(category, offerId);
  redirect("/featured?ok=1");
}

export default async function FeaturedPage({
  searchParams,
}: {
  searchParams: Promise<{ err?: string; ok?: string }>;
}) {
  const q = await searchParams;
  const store = await loadStore();
  const stripeReady = Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_FEATURED);

  return (
    <>
      <h1>Featured slots</h1>
      <p className="lede">
        Self-serve vendor placement. Featured is always labeled and never sorts above a better organic
        fit. No sales team.
      </p>
      <h2>Current slots</h2>
      <ul className="plain">
        {CATEGORIES.map((c) => (
          <li key={c}>
            {CATEGORY_LABELS[c]}: {store.featured[c] ? getOffer(store.featured[c])?.name : "empty"}
          </li>
        ))}
      </ul>
      {stripeReady ? (
        <p className="notice">
          Stripe Checkout is configured. Use POST /api/featured/checkout with{" "}
          <code>category</code> and <code>offerId</code>.
        </p>
      ) : (
        <p className="notice">
          Set <code>STRIPE_SECRET_KEY</code> and <code>STRIPE_PRICE_FEATURED</code> for paid checkout.
          Until then, use the local admin form (not for production).
        </p>
      )}
      <h2>Local admin (dev)</h2>
      {q.ok ? <p className="meta">Slot updated.</p> : null}
      {q.err ? <p className="meta">Could not update ({q.err}).</p> : null}
      <form action={adminFeatured}>
        <label>
          Admin secret
          <input name="secret" type="password" />
        </label>
        <label>
          Category
          <select name="category">
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Offer id
          <input name="offerId" placeholder="e.g. railway" />
        </label>
        <button type="submit">Set Featured</button>
      </form>
    </>
  );
}
