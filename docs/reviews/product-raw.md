# Product correctness review (raw)

**Agent:** Product correctness review  
**Aspect score:** 3 / 5  
**Verdict:** READY WITH FIXES

## Critical

1. MCP may not share Featured datastore with web → paid vendor can appear as unlabeled organic[0].
2. `assert-featured` is weak; `featuredNeverOutranksOrganic()` is a no-op stub.

## High

- Language matching: `java` ⊆ `javascript`; lock-in/budget scoring buggy.
- Ledger 70/30 math OK but not idempotent; negative amounts allowed.
- Short click IDs; admin secret default.

## Medium

- 3-vendor categories → only 2 organic when Featured set.
- Website ranking omits `packages` / package.json.
- Redirect SubIDs may not match network-native fields.
- `/go` works without affiliateUrl.
- Stripe webhook doesn’t re-validate category↔offer.

## What already works

Featured labeled & filtered from organic when datastore shared; no Kickbacks; all `tosCashbackOk: false`; 12×3; CPA only railway/DO/pinecone; tracked-without-cashback CTA; MCP search-only.
