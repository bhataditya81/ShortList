# Shortlist

Repo-aware shortlist of developer tools: **organic comparison first**, optional **labeled Featured**, cashback **only when money moves** and the vendor program allows rebate.

This is **not** Kickbacks. We do not sell wait-state or spinner ads.

## What you get

- Website (primary): browse 12 categories × 3 organic vendors, stack re-rank, tracked redirect, payout ledger stub, Featured self-serve.
- Optional MCP: `search_tools({ category, stack_signals, package_json_path? })` — same ranker. When `stack_signals.packages` is omitted, MCP reads `package_json_path` or `./package.json` from cwd. Featured never outranks a better organic fit.
- Live public CPA (apply yourself): Railway (instant), DigitalOcean (CJ), Pinecone (PartnerStack). See [docs/affiliate-applications.md](docs/affiliate-applications.md).
- Distribution rules: [docs/distribution.md](docs/distribution.md) — site first; do not list on Anthropic’s directory as an ad vehicle; Cursor Marketplace plugins stay free.
- **Hosting:** local + **Vercel free (Hobby)** — see [docs/distribution.md](docs/distribution.md) for GitHub → Vercel setup. **AWS only when founder OK.** See [Task.md](Task.md).

## Run (local)

```bash
npm install
npm run build:packages
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000

MCP after packages + mcp build:

```bash
npm run build -w @shortlist/mcp
node apps/mcp/dist/index.js
```

## Cash-out

Stripe Connect Express is stubbed (`POST /api/connect/onboard` → 501). Ledger minimum is **$25**, not $10.

## Ranking rule

Organic score uses language, packages, region, budget, lock-in. Featured is labeled and listed **after** organic even if it would score higher.
