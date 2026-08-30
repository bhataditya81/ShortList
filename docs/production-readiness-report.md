# Shortlist — combined production readiness report

**Date:** 2026-08-30  
**Repo:** https://github.com/bhataditya81/MoneyAgent (`main`)  
**Question:** Is this ready for production?

## Overall verdict: **NOT READY for production**

| Aspect | Agent | Verdict | Score |
|--------|--------|---------|-------|
| Security & trust | [Security production review](https://github.com/bhataditya81/MoneyAgent) | **NOT READY** | **2 / 5** |
| Product correctness | [Product correctness review](https://github.com/bhataditya81/MoneyAgent) | **READY WITH FIXES** | **3 / 5** |
| Ops / deploy | [Ops production readiness review](https://github.com/bhataditya81/MoneyAgent) | **NOT READY** | **2 / 5** |

**Composite:** ~**2.3 / 5**. Safe framing today: **local / founder demo**. Private beta on Vercel Hobby only after the “must fix” list below. Do **not** market cash-out, durable accounts, or production cashback.

Independent raw notes: [`docs/reviews/`](./reviews/).

---

## Consensus (all three agree)

These show up across security + ops (and partly product):

1. **Email-only Auth.js = account takeover** — type any `@` email, become that user.
2. **`FEATURED_ADMIN_SECRET` defaults to `dev-featured`** — public `/featured` + `/admin/ledger` / ledger API can mint Featured + fake balances.
3. **JSON store on Vercel is not durable** — need Neon `DATABASE_URL`; docs must not say “DATABASE_URL not needed.”
4. **Ledger imports are not idempotent** — same `clickId` can be credited repeatedly; no UNIQUE; weak amount validation.
5. **Stripe Connect cash-out is a 501 stub** — do not promise payouts.
6. **Short click IDs + unauthenticated `/r/{clickId}`** — guessable; leaks `userId` as `subId` to vendors.

Product review adds: ranking quality bugs and MCP/web Featured datastore skew — important, but security/ops already block “production.”

---

## Must fix before any public traffic (even Hobby)

| # | Fix | Sources |
|---|-----|---------|
| 1 | Real auth (magic link / OAuth / OTP) — not “email is password” | Security |
| 2 | **No default** admin secret; fail closed if unset; gate or remove Featured admin form in prod | Security, Ops, Product |
| 3 | Require `DATABASE_URL` on Vercel; fix `ensureSchema` (don’t drop `users` DDL); ship `schema.sql` in the serverless bundle **or** document manual Neon apply | Ops |
| 4 | Align `docs/distribution.md` with P0 playbook (`AUTH_SECRET`, `DATABASE_URL`) | Ops |
| 5 | Ledger: UNIQUE(click_id), reject ≤0 amounts, `timingSafeEqual` for secrets | Security, Product |
| 6 | Harden `/r`: auth or signed tokens; longer IDs; allowlist affiliate URL schemes/hosts | Security |
| 7 | Fix login `next=` open redirect (`//evil.com`) | Security |
| 8 | Do not enable Connect until 1–6 done | Security, Ops |

---

## Should fix before calling it a serious private beta

| # | Fix | Sources |
|---|-----|---------|
| 9 | MCP and web must share Featured store (`DATABASE_URL` in MCP env or shared path) | Product |
| 10 | Strengthen ranker language/lock-in/budget matching; strengthen `assert-featured` | Product |
| 11 | Website pass `packages` / package.json for real repo-aware ranking | Product |
| 12 | Stripe webhook: `payment_status`, idempotency, category↔offer check; Featured expiry | Security, Ops, Product |
| 13 | Health check + basic error logging | Ops |
| 14 | Pin Node 20 on Vercel; don’t rely on build-time-inlined affiliate env without redeploy | Ops |

---

## What is already in good shape

- Featured **label + exclude from organic[0]** when the same datastore is used (product score 3/5).
- No Kickbacks / wait-state / spinner ads.
- All catalog `tosCashbackOk: false`; tracked-without-cashback CTA exists.
- Catalog **12×3**; public CPA flags only Railway / DigitalOcean / Pinecone.
- Stripe webhook **signature verification** present.
- Monorepo `apps/web/vercel.json` install/build pattern is plausible for Hobby.
- MCP is search-only (no ALWAYS-call); intended as **local stdio**, not hosted.

---

## Recommended posture by stage

| Stage | Allowed? | Conditions |
|-------|----------|------------|
| **Local founder demo** | Yes | Current code OK for you clicking around |
| **Vercel Hobby private link** | Only after must-fix 1–8 | Neon + real secrets; no cash-out claims; invited testers only |
| **Production / public launch** | **No** | Needs auth, money path, ranking/MCP alignment, observability |

---

## Suggested fix order (engineering)

1. Kill admin secret default + login open redirect + require `AUTH_SECRET`/`FEATURED_ADMIN_SECRET` at boot.  
2. Neon + fix schema apply; update distribution docs.  
3. Replace email-only credentials with magic link or OAuth.  
4. Ledger uniqueness + `/r` hardening.  
5. Stripe Featured production checks; keep Connect blocked.  
6. Ranker + MCP Featured parity + stronger asserts.

---

## Scores at a glance

```text
Security ████░░░░░░ 2/5  NOT READY
Product  ██████░░░░ 3/5  READY WITH FIXES
Ops      ████░░░░░░ 2/5  NOT READY
─────────────────────────
Overall  NOT PRODUCTION READY
```

Your P0 playbook remains valid for affiliate/Stripe **operator** work, but **do not** treat a raw Hobby deploy as production until the must-fix list lands.

---

## POC hardening status (2026-08-30 follow-up)

Engineering landed for a **Railway-only private POC** (cashback still off):

| Must-fix | Status |
|-----------|--------|
| No `dev-featured` default; admin uses `timingSafeEqual` | Done |
| Login `next=` open redirect blocked | Done |
| `AUTH_SECRET` required at runtime; build-safe placeholder | Done |
| Schema inlined + UNIQUE(`click_id`); longer IDs | Done |
| `/r` requires session + owner; no `subId` leak; HTTPS allowlist | Done |
| `docs/distribution.md` requires `AUTH_SECRET` + `DATABASE_URL` on Vercel | Done |
| Email allowlist via `SHORTLIST_ALLOWED_EMAILS` | Done (partial — not full magic link) |
| Connect remains 501 | Unchanged (correct for POC) |

Still **not** production: email-only credentials (mitigated by invite list), Stripe Featured/#5, DO/Pinecone.

