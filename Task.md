# Shortlist — project plan & tasks

**One line:** G2’s comparison moment + Rakuten-style cashback, inside the repo — paid only when money moves. **Not** spinner / wait-state ads (Kickbacks).

**Primary surface:** website (`apps/web`). **Optional:** MCP `search_tools`. Featured is labeled and never outranks a better organic fit.

---

## Product rules (non-negotiable)

| Do | Do not |
|----|--------|
| Organic shortlist of 3 per category | Patch Claude / Cursor wait UI |
| Labeled Featured after organic | Silent paid #1 / bid-ranked organic |
| Cashback only on TOS-safe CPA + paid conversion | Pay for impressions / cookie-stuff |
| First-party `/r/{clickId}` + SubIDs | Invent affiliate URLs for Clerk/Stripe/OpenAI |
| Site first; MCP optional | Submit to Anthropic directory as an ad vehicle |
| Cursor Marketplace plugin free (if listed) | Build another paid MCP directory |

---

## What already shipped (MVP scaffold)

- [x] Monorepo: `apps/web`, `apps/mcp`, `packages/catalog`, `packages/ranker`, `packages/data-store`
- [x] Catalog: **12 categories × 3 vendors** (36). Public CPA flags only: Railway, DigitalOcean, Pinecone. **All** `tosCashbackOk: false`
- [x] Ranker + `assert-featured` (Featured excluded from organic top-3)
- [x] MCP `search_tools({ category, stack_signals })`
- [x] Next site: browse, login, account ledger, Featured admin/Stripe hooks, `/go` → `/r` redirect
- [x] Payout ledger stub; cash-out min **$25**; Connect onboard **501** until platform enabled
- [x] Docs: `docs/affiliate-applications.md`, `docs/distribution.md`
- [x] Cursor agents: `catalog-researcher`, `affiliate-tos`, `organic-ranker`

```bash
npm install
npm run build
npm run start -w @shortlist/web   # http://localhost:3000
```

---

## Profitability reality (read before building more)

Cashback-only at 30% of a typical 20% × 12-month affiliate ≈ **~6% of referred SaaS spend** (~$2.94/mo on a $49 plan). **$10k platform MRR** needs ~**283 new paid conversions/month** forever (residuals fall off at month 12).

90-day cashback alone is not the business. **Featured self-serve (Stripe)** is the path that can work without a sales team. Live CPA inventory without outreach is **2–4 programs**, not 36.

---

## Open work (GitHub issues)

Track these as independent issues. Prefer one PR per issue.

### P0 — money & inventory

1. **Join Railway affiliate** — copy refer link → `RAILWAY_AFFILIATE_URL` in `.env.local`. See `docs/affiliate-applications.md`.
2. **Apply DigitalOcean via CJ** — on approval set `DIGITALOCEAN_AFFILIATE_URL`.
3. **Apply Pinecone via PartnerStack** — Network + vendor approval → `PINECONE_AFFILIATE_URL`.
4. **Stripe Featured live** — `STRIPE_SECRET_KEY`, `STRIPE_PRICE_FEATURED`, webhook → `/api/stripe/webhook` sets Featured slot. Remove reliance on admin secret in production.
5. **Stripe Connect Express** — enable platform; implement `/api/connect/onboard`; pay when ledger ≥ $25.

### P1 — product quality

6. **Postgres instead of JSON store** — replace `packages/data-store` file store for multi-instance / Vercel.
7. **Real auth** — Clerk or Auth.js (replace email-only demo session).
8. **Repo-aware stack signals** — parse `package.json` / lockfile in MCP (or thin Cursor extension) and pass into `stack_signals`.
9. **TOS gate workflow** — per-offer review before flipping `tosCashbackOk`; document in catalog notes.
10. **Conversion import UX** — admin UI for `POST /api/ledger/confirm` (CSV from Railway/CJ/PS dashboards).

### P2 — distribution (not directories)

11. **Deploy website** — Vercel + env vars; custom domain.
12. **Cursor MCP install docs** — one-click / copy config from README (plugin free only).
13. **Do not** list on Anthropic software directory while Featured/affiliate CTAs exist in MCP.
14. **Optional free Cursor Marketplace** listing if review-safe (no wait-state ads, honest ranking).

### Explicit backlog bans

- Kickbacks / IdleAds / status-bar sponsored lines
- Cookie stuffing / unsigned auto-update / CSP weakening
- Paying users for impressions
- Cold email / LinkedIn BD to vendors (forms only)

---

## Architecture (current)

```
User / agent
  → apps/web (browse, login, Featured)  OR  apps/mcp search_tools
  → packages/ranker (organic 3 + labeled Featured)
  → /go/{offerId} → packages/data-store click → /r/{clickId} 302 + subId
  → vendor checkout → network (Railway / CJ / PartnerStack)
  → ledger confirm (stub) → Stripe Connect cash-out (stub, $25 min)
```

---

## Categories (V1)

auth, db, hosting, email, payments, observability, errors, feature-flags, queues, storage, llm-router, vector

---

## How to work independently

1. Pick a GitHub issue from the list above (or create one that matches a bullet).
2. Branch: `feat/<issue-number>-short-name` or `fix/...`.
3. Keep PRs small; reference `#<issue>`.
4. Never enable cashback without `affiliate-tos` review.
5. Run `npm run build` and `npm run assert-featured -w @shortlist/ranker` before merge.

Issue templates mirror this file’s P0–P2 sections. Update this file when milestones land.
