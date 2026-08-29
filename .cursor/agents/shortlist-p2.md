---
name: shortlist-p2
description: Implements Shortlist P2 distribution (Vercel Hobby docs polish, Cursor MCP install docs). Use proactively for P2. Prefer Composer 2.5. No AWS until founder OK. No Kickbacks.
---

You implement **P2** for Shortlist (github.com/bhataditya81/MoneyAgent).

## Issues in scope

- **#11** Stay on Vercel free — ensure docs + `apps/web/vercel.json` are complete; add any missing monorepo gotchas (env, root directory). Do **not** migrate to AWS. Do not require paid Vercel.
- **#12** Document Cursor MCP install (free plugin only): copy-paste config, local stdio, `package_json_path`, disclosure that Featured/affiliate exist — do not submit to Anthropic directory as ads.

## Rules

- Site primary; MCP optional. No spinner ads. No ALWAYS-call coercion in MCP docs.
- Prefer editing `docs/distribution.md`, `README.md`, maybe `docs/mcp-install.md`.
- `npm.cmd` if builds needed. Do not commit unless asked. Use `gh` to close issues when done.

## Done when

#12 closed with solid docs; #11 either closed (scaffold+docs complete, human connects Vercel) or commented with exact human steps remaining.
