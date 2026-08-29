# P0 — Money & inventory (founder playbook)

**You own this track.** Agents are shipping P1/P2 in parallel. Do **not** enable cashback (`tosCashbackOk`) until [#9](https://github.com/bhataditya81/MoneyAgent/issues/9) TOS review.

**Repo:** https://github.com/bhataditya81/MoneyAgent  
**Env template:** [`.env.example`](../.env.example)  
**Affiliate signup notes:** [`docs/affiliate-applications.md`](../docs/affiliate-applications.md)

---

## Goal of P0

Get **real tracked affiliate links** for the few programs that allow form-join, and wire **Stripe Featured + Connect** so money can move. Organic catalog already exists; cashback stays **off** by default.

```text
You join programs (forms) → paste tracking URLs in env
User clicks /go → /r/{clickId}?subId=… → vendor
Vendor pays YOU commission → import into ledger → user cash-out later (#5)
Vendors buy Featured via Stripe Checkout (#4)
```

---

## Issue checklist

| Issue | Owner | Depends on | Done when |
|-------|--------|------------|-----------|
| [#1](https://github.com/bhataditya81/MoneyAgent/issues/1) Railway | You | — | `RAILWAY_AFFILIATE_URL` set; link opens tracked signup |
| [#2](https://github.com/bhataditya81/MoneyAgent/issues/2) DigitalOcean / CJ | You | CJ publisher account | `DIGITALOCEAN_AFFILIATE_URL` set after approval |
| [#3](https://github.com/bhataditya81/MoneyAgent/issues/3) Pinecone / PartnerStack | You | PS Network + Pinecone approval | `PINECONE_AFFILIATE_URL` set |
| [#4](https://github.com/bhataditya81/MoneyAgent/issues/4) Stripe Featured | You + small config | Stripe account | Checkout + webhook sets Featured slot on live/Hobby URL |
| [#5](https://github.com/bhataditya81/MoneyAgent/issues/5) Connect $25 cash-out | You + later code | Stripe Connect platform enabled | Users can KYC + withdraw ≥ $25 payable |

Suggested order: **#1 → #4 (test money loop) → #2/#3 (while waiting) → #5**.

---

## #1 — Railway (instant)

1. Create/login [Railway](https://railway.com).
2. Open [Affiliate program](https://railway.com/affiliate-program) / workspace **Refer** link ([docs](https://docs.railway.com/community/affiliate-program)).
3. Copy your unique referral URL.
4. Local: add to `apps/web/.env.local` (and Vercel env when deployed):

```env
RAILWAY_AFFILIATE_URL=https://railway.com/?referralCode=YOUR_CODE
```

(Use the exact URL Railway gives you.)

5. Restart `npm run dev` / redeploy. Catalog id `railway` picks this up via `withAffiliateOverlay` in `@shortlist/catalog`.
6. **Keep `tosCashbackOk: false`** until you read Railway’s terms for paying end users a cut.
7. Smoke test: log in on site → open Hosting → if cashback UI appears only when `tosCashbackOk` is true; until then “Open site” is fine. Tracking still works once `affiliateUrl` is set — today cashback button requires `tosCashbackOk && affiliateUrl`. So for POC tracking you may temporarily need a code path that uses affiliate URL without promising cashback, **or** use Featured / redirect tests. Check `OfferCard`: cashback link only if both flags. **Action:** after setting URL, either leave organic “Open site” (homepage) or we later add “Tracked signup (no cashback)” — for now verify overlay with a quick local log or temporary Featured slot pointing at railway.

**Verify overlay locally:**

```bash
# After setting env and rebuilding packages
node --input-type=module -e "import { getOffer } from './packages/catalog/dist/index.js'; console.log(getOffer('railway'));"
```

Expect `affiliateUrl` non-null.

**Close #1** when URL is in env (local + Vercel) and `getOffer('railway').affiliateUrl` is set.

---

## #2 — DigitalOcean via CJ

1. Create a [CJ Affiliate](https://www.cj.com/) publisher account.
2. Apply to DigitalOcean from [digitalocean.com/affiliates](https://www.digitalocean.com/affiliates) (~10% of spend × 12 months — confirm in CJ).
3. Wait for approval (manual review common).
4. Generate tracking link; set:

```env
DIGITALOCEAN_AFFILIATE_URL=...
```

5. Do **not** market as cashback until CJ + DO terms allow incentive traffic.
6. **Close #2** when approved + env set.

If rejected: note reason on the issue; swap catalog CPA flag later — do not invent links.

---

## #3 — Pinecone via PartnerStack

1. Apply to [PartnerStack Network](https://support.partnerstack.com/hc/en-us/articles/20574018677395-Joining-the-PartnerStack-Network) (site + LinkedIn help).
2. Then apply to [Pinecone on PartnerStack](https://market.partnerstack.com/page/pinecone) (~10% year 1, $1,200 cap — confirm).
3. On approval, create link with SubIDs if available; set:

```env
PINECONE_AFFILIATE_URL=...
```

4. Cashback stays off until TOS review (#9).
5. **Close #3** when env set.

---

## #4 — Stripe Featured (self-serve)

Code already has:

- `POST /api/featured/checkout`
- `POST /api/stripe/webhook` → `setFeatured`
- Local admin form on `/featured` (dev secret)

**Your steps:**

1. Stripe account (test mode first).
2. Create a **Payment** Price (one-time) for “Featured category slot” — note Price id `price_...`.
3. Env (local + Vercel):

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_FEATURED=price_...
STRIPE_WEBHOOK_SECRET=whsec_...   # after step 5
SESSION_SECRET=long-random
FEATURED_ADMIN_SECRET=long-random
```

4. Deploy or use Stripe CLI for local webhooks:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

5. On Vercel Hobby: add endpoint `https://YOUR_APP.vercel.app/api/stripe/webhook` for `checkout.session.completed`.
6. Test: `POST /api/featured/checkout` with JSON `{ "category": "hosting", "offerId": "railway" }` → pay → Featured shows on `/c/hosting`.
7. Production: remove or lock down admin secret form.

**Close #4** when test checkout sets Featured without using only the admin form.

**Caveat:** JSON data-store does **not** persist on Vercel serverless. Featured/webhook may “work” then vanish. For a durable Featured POC you need [#6](https://github.com/bhataditya81/MoneyAgent/issues/6) Postgres (P1, agents should ship). Until then, validate Featured in **local** or accept ephemeral demo.

---

## #5 — Stripe Connect Express ($25 min)

Code stub: `POST /api/connect/onboard` → 501. Ledger min: `CASH_OUT_MIN_CENTS = 2500`.

**Your steps:**

1. Enable **Stripe Connect** on the platform account; complete platform profile (cashback/rewards may trigger Stripe review).
2. Prefer **Express** connected accounts + Account Links ([docs](https://docs.stripe.com/connect/express-accounts)).
3. Implement (or ask agent after P1): replace 501 with Account Link create; mark ledger `payable` → transfer when ≥ $25.
4. Import a fake conversion locally:

```http
POST /api/ledger/confirm
x-admin-secret: <FEATURED_ADMIN_SECRET>
Content-Type: application/json

{"clickId":"clk_xxxxxxxx","amountCents":980,"note":"test commission"}
```

(`amountCents` = **gross** affiliate commission you received; API stores 70% for the user.)

5. **Close #5** when a test user completes Express KYC and receives a test-mode payout ≥ $25 payable.

Do this **after** #4 and preferably after #6 so balances persist.

---

## Env matrix (copy into Vercel → Settings → Environment Variables)

| Variable | Required for |
|----------|----------------|
| `SESSION_SECRET` | Login cookies |
| `FEATURED_ADMIN_SECRET` | Admin Featured + ledger import |
| `RAILWAY_AFFILIATE_URL` | #1 |
| `DIGITALOCEAN_AFFILIATE_URL` | #2 |
| `PINECONE_AFFILIATE_URL` | #3 |
| `STRIPE_SECRET_KEY` | #4 #5 |
| `STRIPE_PRICE_FEATURED` | #4 |
| `STRIPE_WEBHOOK_SECRET` | #4 |

---

## Hard rules while you work P0

- No Kickbacks / spinner ads.
- Featured never silently ranks above organic.
- No cold email to vendors — **forms only**.
- No cashback marketing until #9.
- Stay on **Vercel Hobby free**; AWS only when you say so.

---

## When stuck

- Affiliate rejected → comment on the GitHub issue with screenshot/reason; keep organic row.
- Stripe Connect blocked → comment on #5; Featured (#4) can still run.
- Need code changes for “tracked link without cashback promise” → open a small issue or ask the implementer agent.

**Full board:** https://github.com/bhataditya81/MoneyAgent/issues  
**Plan:** [`Task.md`](../Task.md)
