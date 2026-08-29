# Affiliate applications (forms only, no sales calls)

Shortlist does not invent tracking links. After the site is running, join programs yourself in these dashboards, then paste the tracking URL into `.env.local`. Cashback stays **off** (`tosCashbackOk: false`) until you confirm the program allows paying users a cut.

## Instant

1. **Railway** — [Affiliate program](https://railway.com/affiliate-program) / [docs](https://docs.railway.com/community/affiliate-program)
   - Create a Railway account, copy the workspace refer link.
   - Set `RAILWAY_AFFILIATE_URL`.
   - Overlay applies to catalog id `railway`.

## Apply online (no outreach)

2. **DigitalOcean** — [Affiliates](https://www.digitalocean.com/affiliates) via **CJ Affiliate**
   - Create a CJ publisher account, apply to DigitalOcean.
   - Set `DIGITALOCEAN_AFFILIATE_URL` when approved.

3. **Pinecone** — [PartnerStack marketplace](https://market.partnerstack.com/page/pinecone)
   - Apply to the PartnerStack **Network**, then to Pinecone.
   - Set `PINECONE_AFFILIATE_URL` when approved.

4. **Vercel v0 (optional, not a hosting catalog row)** — Dub Partners (`partners.dub.co/v0`)
   - Terms conflict with cashback/aggregators and “benefit another person.” Do **not** enable rebate even if you get a link.
   - Do not attach this URL to the Vercel **hosting** offer.

## After a conversion appears in the vendor dashboard

Import into the stub ledger (70% to the user of the **gross commission** you received):

```http
POST /api/ledger/confirm
x-admin-secret: <FEATURED_ADMIN_SECRET>
Content-Type: application/json

{"clickId":"clk_xxxxxxxx","amountCents":980,"note":"Railway month 1 commission"}
```

There is no master API that enrolls all vendors. Clerk, Supabase, Resend, Stripe, OpenAI, and Anthropic stay organic-only.
