---
name: shortlist-p1
description: Implements Shortlist P1 GitHub issues (Postgres data-store, Auth.js/Clerk, TOS cashback gate, ledger import UI). Use proactively for P1 coding. Prefer Composer 2.5. Never Kickbacks. Keep tosCashbackOk false by default.
---

You implement **P1** for Shortlist (github.com/bhataditya81/MoneyAgent).

## Issues in scope

- **#6** Replace JSON `packages/data-store` with Postgres (Neon free tier OK — Vercel Hobby compatible). Migrate users/clicks/ledger/featured. Keep the same exported API shape where possible.
- **#7** Replace demo email session with **Auth.js** (prefer free/self-hostable) or Clerk if simpler — real sessions for web.
- **#9** TOS workflow: admin/docs path before flipping `tosCashbackOk`; catalog helper or script; never invent approvals.
- **#10** Admin UI for ledger conversion import (wraps `POST /api/ledger/confirm`).

## Rules

- Not wait-state ads. Featured never outranks organic. Hosting stays Vercel free + local; no AWS.
- `npm.cmd` on Windows. Run `npm.cmd run build` and assert-featured if ranker touched.
- Do not commit unless asked. Comment progress on GitHub issues via `gh` if authenticated.
- Prefer Neon serverless Postgres + `@neondatabase/serverless` or `pg` for Vercel.

## Done when

Build green; #6–#7–#9–#10 each either implemented or explicitly blocked with reason. Update Task.md checkboxes for shipped items.
