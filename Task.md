# Shortlist — project plan & tasks

**Repo:** https://github.com/bhataditya81/MoneyAgent  
**Issues:** https://github.com/bhataditya81/MoneyAgent/issues  

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

## Hosting plan

| Phase | Where | Notes |
|-------|--------|--------|
| **POC** | **Local only** | `npm run build` + `npm run start -w @shortlist/web` on `localhost:3000`; MCP via local `node apps/mcp/dist/index.js`. JSON data-store is fine. |
| **Later** | **AWS** | Move web + MCP + Postgres off the laptop (e.g. ECS/Fargate or App Runner + RDS/Aurora or Lightsail). Env secrets in SSM/Secrets Manager. No Vercel as the production host. |

Do not spend POC time on cloud deploy. Ship affiliate forms + Stripe wiring against local.

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

| Priority | Issue | Link |
|----------|-------|------|
| P0 | Join Railway affiliate | [#1](https://github.com/bhataditya81/MoneyAgent/issues/1) |
| P0 | DigitalOcean via CJ | [#2](https://github.com/bhataditya81/MoneyAgent/issues/2) |
| P0 | Pinecone via PartnerStack | [#3](https://github.com/bhataditya81/MoneyAgent/issues/3) |
| P0 | Stripe Featured production | [#4](https://github.com/bhataditya81/MoneyAgent/issues/4) |
| P0 | Stripe Connect cash-out $25 | [#5](https://github.com/bhataditya81/MoneyAgent/issues/5) |
| P1 | Postgres data-store | [#6](https://github.com/bhataditya81/MoneyAgent/issues/6) |
| P1 | Clerk / Auth.js | [#7](https://github.com/bhataditya81/MoneyAgent/issues/7) |
| P1 | MCP package.json stack_signals | [#8](https://github.com/bhataditya81/MoneyAgent/issues/8) |
| P1 | TOS before tosCashbackOk | [#9](https://github.com/bhataditya81/MoneyAgent/issues/9) |
| P1 | Ledger import UI | [#10](https://github.com/bhataditya81/MoneyAgent/issues/10) |
| P2 | Deploy to AWS (after local POC) | [#11](https://github.com/bhataditya81/MoneyAgent/issues/11) |
| P2 | Cursor MCP install docs | [#12](https://github.com/bhataditya81/MoneyAgent/issues/12) |

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

1. Pick a GitHub issue from the table above.
2. Branch: `feat/<issue-number>-short-name` or `fix/...`.
3. Keep PRs small; reference `#<issue>`.
4. Never enable cashback without `affiliate-tos` review.
5. Run `npm run build` and `npm run assert-featured -w @shortlist/ranker` before merge.

Update this file when milestones land.
