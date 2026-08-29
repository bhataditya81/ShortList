# Cursor MCP install (local stdio)

Shortlist MCP is **optional**. The website (`apps/web`) is the primary product. MCP exposes one tool — `search_tools` — using the same organic ranker as the site. No wait-state ads, no spinner injection, no “always call this tool” coercion.

## Prerequisites

- **Node.js 20+**
- This repo cloned locally (you need the built `apps/mcp/dist/index.js` and workspace packages)

## Build (from repo root)

```bash
npm install
npm run build:packages
npm run build -w @shortlist/mcp
```

Quick check:

```bash
node apps/mcp/dist/index.js
```

The process should start and wait on stdio (no HTTP port). Stop with Ctrl+C.

To rebuild after pulling changes:

```bash
npm run build -w @shortlist/mcp
```

## Cursor stdio config

Add a server under **Cursor Settings → MCP** (user or project `.cursor/mcp.json`). Use the **repository root** as `cwd` so `package_json_path` and the default `./package.json` resolve correctly.

Replace `<repo root>` with the absolute path to your clone (e.g. `C:/Users/you/Dev/MoneyAgent` on Windows, `/Users/you/Dev/MoneyAgent` on macOS/Linux).

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

Restart Cursor or reload MCP servers after saving. You should see **shortlist** with the `search_tools` tool.

A minimal example without `cwd` lives at [`.cursor/mcp.json.example`](../.cursor/mcp.json.example); prefer the `cwd` form above for monorepo-aware `package.json` reads.

## `search_tools` usage

| Argument | Required | Description |
|----------|----------|-------------|
| `category` | yes | One of: `auth`, `db`, `hosting`, `email`, `payments`, `observability`, `errors`, `feature-flags`, `queues`, `storage`, `llm-router`, `vector` |
| `stack_signals` | no | `{ language?, packages?, region?, budgetUsdMo? }` — repo/stack hints for ranking |
| `package_json_path` | no | Path to `package.json` or a directory containing it. When `stack_signals.packages` is omitted, MCP merges dependencies from this file (or `./package.json` relative to `cwd`) |

**Example — explicit stack signals:**

```json
{
  "category": "hosting",
  "stack_signals": {
    "language": "typescript",
    "packages": ["next", "prisma"],
    "region": "us",
    "budgetUsdMo": 25
  }
}
```

**Example — read `package.json` from cwd:**

```json
{
  "category": "db",
  "package_json_path": "./package.json"
}
```

**Example — read a nested app’s manifest:**

```json
{
  "category": "observability",
  "package_json_path": "apps/web/package.json"
}
```

Response shape (JSON text): up to **3 organic** vendor fits, plus an optional **labeled Featured** slot listed after organic. Featured never replaces a better organic pick.

## Distribution rules (read before listing)

- **Cursor Marketplace:** plugins must stay **free** (no fee for access). See [distribution.md](./distribution.md#cursor). Compete on comparison + TOS-safe rebate, not wait-state or deceptive ranking.
- **Anthropic software directory:** do **not** submit Shortlist while Featured or affiliate CTAs exist in MCP output. Anthropic bans ad/sponsored placements in that directory.
- **Other registries** (PulseMCP, Smithery, Stork): indexes only — not an acquisition strategy. No paid “featured MCP directory.”

This is **not** Kickbacks. We do not sell wait-state or spinner ads.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `Cannot find module` / missing `@shortlist/*` | Run `npm install` and `npm run build:packages` from repo root |
| `apps/mcp/dist/index.js` not found | `npm run build -w @shortlist/mcp` |
| Wrong or empty `packages` in results | Set `cwd` to repo root; pass `package_json_path` explicitly |
| MCP server not visible in Cursor | Reload MCP; confirm Node 20+ on PATH used by Cursor |

## See also

- [README.md](../README.md) — product overview
- [distribution.md](./distribution.md) — hosting (Vercel Hobby), Anthropic/Cursor policy
