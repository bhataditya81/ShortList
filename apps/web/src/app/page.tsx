import Link from "next/link";
import { CATEGORIES, CATEGORY_LABELS } from "@shortlist/catalog";

export default function HomePage() {
  return (
    <>
      <h1>Shortlist</h1>
      <p className="lede">
        G2’s comparison moment, inside the repo: three organic fits for a category, optional labeled
        Featured, cashback only if a vendor program pays us and allows rebate. We sell the choice, not
        wait time.
      </p>
      <div className="notice">
        Cashback is off by default (<code>tosCashbackOk: false</code>). Most named SaaS tools have no
        public CPA or ban incentivized traffic. Browse anyway — the comparison is the product.
      </div>
      <h2>Categories</h2>
      <div className="grid">
        {CATEGORIES.map((id) => (
          <Link key={id} className="card" href={`/c/${id}`}>
            <h3>{CATEGORY_LABELS[id]}</h3>
            <p className="meta">3 organic picks</p>
          </Link>
        ))}
      </div>
    </>
  );
}
