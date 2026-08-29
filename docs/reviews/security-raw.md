# Security review (raw)

**Agent:** Security production review  
**Aspect score:** 2 / 5  
**Verdict:** NOT READY

## Critical

1. Email-only Auth.js = login as anyone (`apps/web/src/auth.ts`).
2. Admin secret defaults to `dev-featured` on `/featured` and `/api/ledger/confirm`.
3. Unauthenticated `/r/{clickId}` leaks `userId` as `subId` and follows affiliate URL.

## High

- Login open redirect via `next=` (`//evil.com`).
- Affiliate env URLs not allowlisted.
- Ledger import: no idempotency, no amount bounds, repeatable credits.
- Short click IDs (8 hex chars).
- `loadStore()` dumps full corpus on account/featured pages.

## Medium

- Auth.js trustHost / cookie / rate-limit gaps.
- Session vs store desync synthesizes users.
- Stripe webhook OK on signature; missing payment_status / idempotency.
- Featured admin form shipped publicly.
- MCP `package_json_path` path traversal (local stdio only).
- Operator can credit ledger while `tosCashbackOk` is false.

## Residual on Vercel Hobby now

Account takeover, fake Featured/ledger, phishing redirects, identifier leakage to vendors. Connect not live yet so ledger fraud is not cashable — enabling Connect without fixes would make it cashable.
