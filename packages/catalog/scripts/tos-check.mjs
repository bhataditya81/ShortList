#!/usr/bin/env node
/**
 * Reminder script — does not edit offers.ts.
 * Usage: node scripts/tos-check.mjs railway
 */
const offerId = process.argv[2];
if (!offerId) {
  console.error("Usage: npm run tos-check -w @shortlist/catalog -- <offerId>");
  process.exit(1);
}
console.log(`
TOS cashback gate — offer: ${offerId}

Before setting tosCashbackOk: true on "${offerId}" in packages/catalog/src/offers.ts:

1. Complete docs/tos-cashback-checklist.md (per-offer review).
2. Run the affiliate-tos Cursor agent on current program terms.
3. Confirm incentivized / rebate traffic is allowed.
4. Edit offers.ts for this id only; rebuild; smoke-test OfferCard.

Default remains tosCashbackOk: false for all offers.
`);
