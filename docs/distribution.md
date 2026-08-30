# Distribution (do not treat MCP listing as the product)

## Hosting

1. **Local** — day-to-day build and MCP (`localhost:3000`, `node apps/mcp/dist/index.js`).
2. **Public POC — Vercel Hobby (free)** — shareable HTTPS. Stay on free tier until the founder is satisfied.
3. **AWS — only when you’re ready** — not scheduled.

Default: free tier until you say otherwise.

### Vercel Hobby (free) — `apps/web`

No paid Vercel plan required. Do **not** deploy AWS until the founder explicitly approves.

1. Push this repo to GitHub (`github.com/bhataditya81/MoneyAgent`).
2. In [Vercel](https://vercel.com/new), **Import** the GitHub repo.
3. **Root Directory:** `apps/web` (monorepo — required so Next.js resolves correctly).
4. Framework preset should detect **Next.js**. `apps/web/vercel.json` sets install/build for npm workspaces:
   - **Install:** `cd ../.. && npm install`
   - **Build:** `cd ../.. && npm run build:packages && npm run build -w @shortlist/web`
5. **Environment variables** — Vercel → Project → Settings → Environment Variables. Copy from [`.env.example`](../.env.example):

   | Var | Required for POC? | Notes |
   |-----|-------------------|--------|
   | `AUTH_SECRET` | **Yes** | `openssl rand -base64 32` — Auth.js JWT signing |
   | `FEATURED_ADMIN_SECRET` | **Yes** | Non-default; never `dev-featured` |
   | `DATABASE_URL` | **Yes on Vercel** | Neon free Postgres — JSON file store is ephemeral on serverless |
   | `RAILWAY_AFFILIATE_URL` | **Yes for #1** | Your https Railway referral URL |
   | `SHORTLIST_ALLOWED_EMAILS` | Recommended | Comma-separated invite list for private beta |
   | Stripe vars | Optional | Featured checkout (#4) only |

6. Apply `packages/data-store/sql/schema.sql` in the Neon SQL editor once (or rely on runtime `ensureSchema()`).
7. **Deploy.** Hit `/api/health` — expect `"ok": true` when secrets + Railway + DB are set.
8. **Stay on free tier** until product validation. AWS migration is founder-gated — see [Task.md](../Task.md).

#### `apps/web/vercel.json` (already in repo)

Monorepo install/build are pinned so Vercel does not run `next build` only inside `apps/web`:

```json
{
  "framework": "nextjs",
  "installCommand": "cd ../.. && npm install",
  "buildCommand": "cd ../.. && npm run build:packages && npm run build -w @shortlist/web"
}
```

If the import wizard ignores this file, set the same commands manually in Project Settings → General.

Local parity before connecting Vercel:

```bash
npm install
npm run build
```

Copy `.env.example` → `apps/web/.env.local` and fill secrets + `RAILWAY_AFFILIATE_URL`.

## Primary surface

The **website** (`apps/web`) is the product users can use without an IDE. MCP is optional.

## Anthropic

Do **not** submit Shortlist to the [Claude software directory](https://support.claude.com/en/articles/13145358-anthropic-software-directory-policy) while Featured or affiliate CTAs exist in the MCP. Anthropic bans ads/sponsored placements in that directory. Claude stays ad-free as a product.

## Cursor

- [Marketplace publisher terms](https://cursor.com/marketplace-publisher-terms): plugins must be **free** (no fee for access). Cashback is not a plugin fee, but wait-state ads and deceptive ranking will fail review.
- Do not patch Cursor/Claude UI, weaken CSP, or pay for impressions.
- If listed, the plugin stays free; compete as comparison + (TOS-safe) rebate, not as Cursor’s chrome.

## MCP registries

PulseMCP / Smithery / Stork are **indexes**, not an acquisition strategy. Do not build a paid “featured MCP directory.”

## MCP install

Full copy-paste stdio config, build steps, `package_json_path`, and `search_tools` examples: **[mcp-install.md](./mcp-install.md)**.
