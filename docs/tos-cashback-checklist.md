# TOS cashback checklist

Before setting `tosCashbackOk: true` on any offer in `packages/catalog/src/offers.ts`, complete this checklist. **Default stays `false`.** Run the `affiliate-tos` Cursor agent for a second opinion when unsure.

## Per-offer review

1. **Identify the program** — network (Railway, CJ, PartnerStack, in-house, etc.) and the exact affiliate agreement URL.
2. **Read current terms** — not a blog post; the publisher/partner agreement and any “incentivized traffic” or “coupon site” clauses.
3. **Model our flow** — user clicks Shortlist tracked link → signs up on vendor → we receive CPA → we pay user ~70% of commission. Treat this as **rebate / incentivized traffic**, not a neutral comparison link.
4. **Check bans** — coupon aggregators, cashback sites, paying third parties from your commission, cookie stuffing, misleading claims, trademark bidding (if applicable).
5. **Document decision** — note date, reviewer, agreement version, and one-line rationale in your issue or MR.
6. **Set env overlay only after approval** — `RAILWAY_AFFILIATE_URL`, `DIGITALOCEAN_AFFILIATE_URL`, `PINECONE_AFFILIATE_URL` can be set for **tracked** links without cashback UI; cashback button requires both `affiliateUrl` and `tosCashbackOk`.
7. **Flip the flag** — edit `tosCashbackOk` in `packages/catalog/src/offers.ts` for that offer id only.
8. **Smoke test** — category page shows “Get cashback” only for that offer; organic ranking unchanged; Featured still labeled.

## How to flip `tosCashbackOk` (catalog)

```bash
# 1. Complete checklist above for one offer id (e.g. railway).
# 2. Edit packages/catalog/src/offers.ts — set tosCashbackOk: true on that offer only.
# 3. Rebuild and verify OfferCard on the category page.
npm.cmd run build
```

Optional helper (prints reminder, does not edit files):

```bash
npm.cmd run tos-check -w @shortlist/catalog -- railway
```

## Never

- Enable cashback on all 36 offers at once.
- Invent affiliate URLs or assume “everyone allows rebates.”
- Enable Kickbacks / wait-state / spinner inventory (out of scope for Shortlist).

## Related

- `docs/affiliate-applications.md` — how to join programs
- `.cursor/agents/affiliate-tos.md` — agent for term review
- `Task.md` — P0 affiliate issues #1–#3
