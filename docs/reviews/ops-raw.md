# Ops / production readiness review (raw)

**Agent:** Ops production readiness review  
**Aspect score:** 2 / 5  
**Verdict:** NOT READY

Source: independent Grok 4.6 review of Shortlist `main`.

## Critical (summary)

1. JSON fallback on Vercel = data loss; `DATABASE_URL` must be required for real POC; `docs/distribution.md` wrongly says DATABASE_URL not needed.
2. `ensureSchema()` comment-splitting likely drops `CREATE TABLE users`.
3. `schema.sql` may not be traced into the Vercel serverless bundle (`ENOENT`).
4. `AUTH_SECRET` required in production; distribution docs under-document it; email-only credentials = impersonation risk.

## High (summary)

5. `FEATURED_ADMIN_SECRET` defaults to `dev-featured` on public pages.
6. Stripe Connect is 501; cash-out not real.
7. `ensureSchema` + full `loadStore` on many requests; Neon cold-start risk.
8. No pooling / AWS path is docs-only.

## Medium / Low

- Vercel monorepo commands plausible; pin Node 20.
- No health check / observability.
- Catalog env affiliate URLs may be build-time inlined.
- Docs disagree (distribution vs P0 playbook).

## Minimum private beta

Neon `DATABASE_URL` + apply schema manually + `AUTH_SECRET` + non-default admin secret; Stripe test Featured only; no cash-out promises; ignore stale distribution env section.

## Blockers for “production”

Working migrations + durable store; real auth; Connect or remove cash-out UI; Featured idempotency/expiry; health/docs aligned.
