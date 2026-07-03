# Public read-only API

The same JSON API that powers wcoin.casino. Free, no key, no auth. Please be polite (cache ≥60s; data refreshes ~every 30 min server-side).

Base URL: `https://wcoin.casino/api`

| Endpoint | Returns |
|---|---|
| `GET /api/stats` | Headline market stats: verified volume, reserves, counterparties, casinos tracked. |
| `GET /api/brands?category=casino` | Brand-merged operators: verified 7d/24h volume, in/outflow, reserves + coverage, blended trust, per-chain split, member wallets (label/chain/address), `volumeSuspect` flag. **This is the export source for `data/attributed-wallets.json`.** |
| `GET /api/casinos?category=casino` | Entity-level (per wallet-cluster) rows behind the brands. |
| `GET /api/coverage` | Coverage counters: casinos catalogued, chains indexed, streamers, reserves total. |
| `GET /api/flow` | Deposit vs withdrawal flow buckets (credible universe only). |
| `GET /api/series?days=N&category=casino` | Daily deposit/withdrawal time series. |
| `GET /api/streamers` | Tracked gambling streamers (Kick/Twitch/YouTube): live status, viewers, followers, socials, affiliation. |
| `GET /api/sentiment` | Blended third-party trust per operator (casino.guru / Trustpilot / AskGamblers / editorial) + complaint counts. |
| `GET /api/marketSnapshot` | The daily report payload (also rendered at `/daily`). |
| `GET /api/diag/coverage` | Attribution coverage diagnostics: wallets & named brands by source (curated / dune / btc-cluster). |
| `GET /api/labels/export` | **Open-data provenance export**: every active casino wallet with its evidence source and first-seen date, plus the infra denylist. This is what `scripts/export.mjs` consumes. |

## Reading the flags

- `volumeSuspect: true` → the operator's transfer pattern is anomalous (wash/treasury-churn-like). Its volume is shown as **"Under review"** on-site and must not be treated as player activity. The companion `volumeSuspectReasons` array says why: `abnormal_avg_transfer_size` · `high_volume_per_counterparty` · `manually_flagged_wash_or_treasury_pattern` (see DATA_DICTIONARY.md).
- `attributed: false` → casino-pattern flow we could not tie to a named brand; excluded from verified figures.
- Reserve `coverage` → how complete our wallet mapping is for that brand (a level, deliberately not a percentage).

## Machine-readable site summary

- `https://wcoin.casino/llms.txt` — structured summary for AI answer engines
- `https://wcoin.casino/sitemap.xml` — all indexable SSR pages
