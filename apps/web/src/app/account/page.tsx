import Link from "next/link";
import { redirect } from "next/navigation";
import { CASH_OUT_MIN_CENTS, loadStore, userBalanceCents } from "@shortlist/data-store";
import { getOffer } from "@shortlist/catalog";
import { clearSession, getSessionUser } from "@/lib/session";

async function logout() {
  "use server";
  await clearSession();
  redirect("/");
}

export default async function AccountPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/account");
  const bal = userBalanceCents(user.id);
  const store = loadStore();
  const clicks = store.clicks.filter((c) => c.userId === user.id).slice(-20).reverse();
  const ledger = store.ledger.filter((l) => l.userId === user.id).reverse();

  return (
    <>
      <h1>Account</h1>
      <p className="lede">{user.email}</p>
      <div className="grid">
        <div className="card">
          <h3>Confirmed</h3>
          <p>${(bal.confirmed / 100).toFixed(2)}</p>
        </div>
        <div className="card">
          <h3>Payable</h3>
          <p>${(bal.payable / 100).toFixed(2)}</p>
        </div>
        <div className="card">
          <h3>Paid</h3>
          <p>${(bal.paid / 100).toFixed(2)}</p>
        </div>
      </div>
      <p className="notice">
        Stripe Connect cash-out is stubbed until platform onboarding. Minimum{" "}
        <strong>${(CASH_OUT_MIN_CENTS / 100).toFixed(0)}</strong> (not $10) so Connect fees do not eat
        the take. Ledger stays pending until a conversion is imported from the affiliate dashboard.
      </p>
      <form action={logout}>
        <button className="secondary" type="submit">
          Log out
        </button>
      </form>
      <h2>Recent tracked clicks</h2>
      <ul className="plain">
        {clicks.length === 0 ? <li className="meta">None yet</li> : null}
        {clicks.map((c) => (
          <li key={c.id}>
            {getOffer(c.offerId)?.name ?? c.offerId} · {c.id} · {c.createdAt}
          </li>
        ))}
      </ul>
      <h2>Payout ledger</h2>
      <ul className="plain">
        {ledger.length === 0 ? <li className="meta">Empty — import a conversion via POST /api/ledger/confirm</li> : null}
        {ledger.map((row) => (
          <li key={row.id}>
            {row.status} · ${(row.amountCents / 100).toFixed(2)} · {getOffer(row.offerId)?.name} ·{" "}
            {row.note}
          </li>
        ))}
      </ul>
      <p className="meta">
        <Link href="/">Browse categories</Link>
      </p>
    </>
  );
}
