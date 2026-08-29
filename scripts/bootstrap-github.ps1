# Bootstrap GitHub repo + independent issues for Shortlist
# Prerequisites: gh auth login (complete device flow), then:
#   powershell -File scripts/bootstrap-github.ps1

$ErrorActionPreference = "Stop"
$repoName = "MoneyAgent"
$visibility = "private"  # change to public if desired

gh auth status

$owner = (gh api user --jq .login)
Write-Host "Creating $owner/$repoName ($visibility)..."

$created = $false
try {
  gh repo create $repoName --$visibility --source=. --remote=origin --push
  $created = $true
} catch {
  Write-Host "create/push may have partially run: $_"
}

if (-not $created) {
  if (-not (git remote get-url origin 2>$null)) {
    gh repo create $repoName --$visibility --description "Shortlist: repo-aware tool shortlists + labeled Featured (not wait-state ads)"
    git remote add origin "https://github.com/$owner/$repoName.git"
  }
  git push -u origin main
}

$labels = @(
  @{ n = "P0"; c = "B60205"; d = "Money and inventory" },
  @{ n = "P1"; c = "D93F0B"; d = "Product quality" },
  @{ n = "P2"; c = "FBCA04"; d = "Distribution" },
  @{ n = "affiliate"; c = "0E8A16"; d = "Affiliate / CPA" },
  @{ n = "payments"; c = "1D76DB"; d = "Stripe / Connect" },
  @{ n = "mcp"; c = "5319E7"; d = "MCP / IDE" }
)
foreach ($l in $labels) {
  gh label create $l.n --color $l.c --description $l.d 2>$null
}

$issues = @(
  @{ t = "Join Railway affiliate and set RAILWAY_AFFILIATE_URL"; l = "P0,affiliate"; b = @"
## Goal
Get a live Railway refer link into env overlay for catalog id ``railway``.

## Steps
1. Follow ``docs/affiliate-applications.md`` (Railway section).
2. Set ``RAILWAY_AFFILIATE_URL`` in deployment env / ``.env.local``.
3. Verify ``getOffer('railway').affiliateUrl`` after restart.
4. Do **not** set ``tosCashbackOk`` until TOS review.

Refs: Task.md P0 #1
"@ },
  @{ t = "Apply DigitalOcean via CJ Affiliate"; l = "P0,affiliate"; b = @"
## Goal
Publisher application → tracking URL for ``digitalocean``.

## Steps
1. Create CJ publisher account; apply to DigitalOcean.
2. On approval set ``DIGITALOCEAN_AFFILIATE_URL``.
3. Keep ``tosCashbackOk: false`` until terms allow rebate.

Refs: Task.md P0 #2, docs/affiliate-applications.md
"@ },
  @{ t = "Apply Pinecone via PartnerStack"; l = "P0,affiliate"; b = @"
## Goal
PartnerStack Network + Pinecone program approval → ``PINECONE_AFFILIATE_URL``.

## Steps
1. Apply to PartnerStack Network, then Pinecone.
2. Set env overlay; leave cashback off by default.

Refs: Task.md P0 #3
"@ },
  @{ t = "Ship Stripe Featured checkout in production"; l = "P0,payments"; b = @"
## Goal
Self-serve Featured slots without admin secret.

## Steps
1. Create Stripe Price for Featured category slot.
2. Set ``STRIPE_SECRET_KEY``, ``STRIPE_PRICE_FEATURED``, ``STRIPE_WEBHOOK_SECRET``.
3. Wire webhook → ``setFeatured``.
4. Lock down or remove ``FEATURED_ADMIN_SECRET`` form in production.

Refs: Task.md P0 #4, apps/web/src/app/api/featured
"@ },
  @{ t = "Enable Stripe Connect Express cash-out at `$25 min"; l = "P0,payments"; b = @"
## Goal
Replace ``POST /api/connect/onboard`` 501 with Express Account Links; pay when ledger ≥ `$25`.

## Notes
Platform may need Stripe business-model review (rewards marketplace).

Refs: Task.md P0 #5, packages/data-store CASH_OUT_MIN_CENTS
"@ },
  @{ t = "Replace JSON data-store with Postgres"; l = "P1"; b = @"
## Goal
Multi-instance safe storage for users, clicks, ledger, featured.

Current: ``packages/data-store`` file JSON. Target: Neon/Supabase Postgres.

Refs: Task.md P1 #6
"@ },
  @{ t = "Replace demo email session with Clerk or Auth.js"; l = "P1"; b = @"
## Goal
Real auth for account, tracked links, Connect KYC.

Refs: Task.md P1 #7, apps/web/src/lib/session.ts
"@ },
  @{ t = "Parse package.json / lockfile for MCP stack_signals"; l = "P1,mcp"; b = @"
## Goal
Repo-aware ranking without manual query params.

Pass language + dependency names into ``search_tools``. No spinner ads. No ALWAYS-call coercion.

Refs: Task.md P1 #8
"@ },
  @{ t = "TOS review workflow before tosCashbackOk"; l = "P1,affiliate"; b = @"
## Goal
Documented per-offer review; use affiliate-tos agent; flip flag only when written terms allow paying users a cut.

Refs: Task.md P1 #9, .cursor/agents/affiliate-tos.md
"@ },
  @{ t = "Admin UI for ledger conversion import"; l = "P1"; b = @"
## Goal
UI (or CSV) for importing network-confirmed commissions into ``POST /api/ledger/confirm``.

Refs: Task.md P1 #10
"@ },
  @{ t = "Deploy website to Vercel with env vars"; l = "P2"; b = @"
## Goal
Production site as primary surface. Configure secrets; do not commit them.

Refs: Task.md P2 #11, docs/distribution.md
"@ },
  @{ t = "Document Cursor MCP install (free plugin only)"; l = "P2,mcp"; b = @"
## Goal
Copy-paste / one-click MCP config. Optional free Marketplace listing if review-safe.

Do **not** submit to Anthropic directory while Featured/affiliate CTAs exist.

Refs: Task.md P2 #12–14, docs/distribution.md
"@ }
)

foreach ($i in $issues) {
  Write-Host "Creating: $($i.t)"
  gh issue create --title $i.t --label $i.l --body $i.b
}

Write-Host "Done. Open: https://github.com/$owner/$repoName/issues"
gh issue list
