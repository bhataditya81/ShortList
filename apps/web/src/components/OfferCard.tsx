import Link from "next/link";
import type { RankedOffer } from "@shortlist/ranker";

export function OfferCard({
  offer,
  kind,
}: {
  offer: RankedOffer;
  kind: "organic" | "featured";
}) {
  const cashback = offer.tosCashbackOk && offer.affiliateUrl;
  const trackedOnly = Boolean(offer.affiliateUrl) && !offer.tosCashbackOk;
  return (
    <article className="card" style={{ marginBottom: "0.75rem" }}>
      <span className={`badge ${kind}`}>{kind === "featured" ? "Featured" : "Organic"}</span>
      {offer.hasPublicCpa ? <span className="badge">Public CPA program</span> : null}
      <h3>
        <a href={offer.url} rel="noreferrer">
          {offer.name}
        </a>
      </h3>
      <p className="meta">Score {offer.organicScore} · {offer.pricing}</p>
      <p className="meta">Lock-in: {offer.lockIn}</p>
      <p className="meta">{offer.reasons.join(" · ")}</p>
      <p className="meta">{offer.commissionNotes}</p>
      <p style={{ marginTop: "0.75rem" }}>
        {cashback ? (
          <Link className="btn" href={`/go/${offer.id}`}>
            Get cashback link
          </Link>
        ) : trackedOnly ? (
          <Link className="btn" href={`/go/${offer.id}`}>
            Tracked signup (no cashback yet)
          </Link>
        ) : (
          <a className="btn secondary" href={offer.url} rel="noreferrer">
            Open site (no cashback)
          </a>
        )}
      </p>
    </article>
  );
}
