# Distribution (do not treat MCP listing as the product)

## Hosting

1. **Local** — day-to-day build and MCP (`localhost:3000`, `node apps/mcp/dist/index.js`).
2. **Public POC — Vercel Hobby (free)** — shareable HTTPS and Stripe webhooks. Stay on free tier until the founder is satisfied with the product.
3. **AWS — only when you’re ready** — optional promotion to App Runner/ECS + managed Postgres. Not scheduled; do not migrate just because the code works.

Default: free tier until you say otherwise.

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

## Example Cursor MCP config (local, after `npm run build`)

```json
{
  "mcpServers": {
    "shortlist": {
      "command": "node",
      "args": ["apps/mcp/dist/index.js"],
      "cwd": "<repo root>"
    }
  }
}
```
