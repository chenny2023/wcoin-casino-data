# Data dictionary

Field-level definitions for everything in `data/` and the public API. If a field isn't listed here, don't guess — open an issue.

## Wallet-level fields (`data/attributed-wallets.json`)

| Field | Meaning |
|---|---|
| `brand` | Canonical operator brand after alias merging (e.g. `Stake.com`, `Stake 11`, per-chain hot wallets → **Stake**). Genuinely distinct products (e.g. Stake US) stay separate. |
| `label` | The raw wallet-cluster label the brand was merged from (kept for traceability back to the source tag). |
| `chain` / `address` | Network + address. Paste into the chain's explorer (or open `evidence_url`) to verify. |
| `wallet_role` | **Behaviour-inferred** from the wallet's own transfers over a rolling 14-day window (thresholds are conservative and published here): `hot_wallet` = two-way flow, ≥50 transfers, ≥20 distinct counterparties (an operating cashier); `deposit_address` = ≥5 external inflows whose outflows are ≥80% internal sweeps to the operator's own wallets; `dormant` = zero transfers in the window (inactivity is the only claim — NOT asserted to be cold storage); `null` = mixed/ambiguous, no claim made. `role_inferred_at` records when the classification last ran. |
| `evidence_type` | How the wallet was attributed: `explorer_name_tag` (block-explorer public name tag), `public_label_set` (Dune `labels.addresses` institution labels), `entity_intelligence` (Arkham entity attribution), `behavioral_cluster` (common-input-ownership expansion). |
| `evidence_source` | Human-readable source behind `evidence_type`. |
| `evidence_url` | The explorer page where you can independently verify the address (and, for name-tag seeds, see the tag itself). |
| `is_seed_wallet` | `true` = direct public evidence (the three seed classes above). `false` = derived by cluster expansion from a seed. Seeds and derived wallets are also physically separated into `seed_wallets` / `derived_wallets` arrays. |
| `cluster_method` | `common_input_ownership` for derived wallets (addresses co-spent in one transaction share an owner); `null` for seeds. |
| `confidence` / `confidence_score` | Attribution confidence. **Scores are evidence-class based, not per-wallet:** explorer name tag = 92, public label set = 88, entity intelligence = 78, behavioral cluster = 62. We deliberately do not publish per-wallet decimal precision we cannot defend. Anything that would score below the cluster class is not published at all. |
| `first_seen_at` | Date the wallet entered our watchlist (from the collector's insert timestamp). |
| `as_of` | Export timestamp. **This is not a per-wallet re-verification date** — explorer tags are checked at curation time and monitored via behaviour, but we do not claim a fresh manual re-check per wallet per release. |
| `volumeSuspect` | Brand-level flag: the operator's transfer pattern is anomalous and its volume must not be read as player activity. Shown as "Under review" on-site; excluded from all volume rankings. |
| `volumeSuspectReasons` | Machine-readable why (empty when not suspect): `abnormal_avg_transfer_size` (average transfer far above real player flow, a treasury/market-making signature), `high_volume_per_counterparty` (volume concentrated in very few counterparties), `manually_flagged_wash_or_treasury_pattern` (curated flag for confirmed cases). Thresholds live in the site source and apply only above a large-volume floor. |

## Wallet categories (policy)

| Category | Where | Policy |
|---|---|---|
| Seed wallets | `seed_wallets` | Direct public evidence. |
| Derived wallets | `derived_wallets` | Cluster-expanded from seeds; inherit the brand only because the seed evidence is strong. |
| Unattributed casino-like wallets | **not in this repo** | Wallets behaving like casino cashiers with no brand evidence. Tracked internally as `Casino-pattern`, excluded from every verified figure, and never published under a brand name. Counts are visible at `/api/diag/coverage`. |
| Excluded infrastructure | `data/excluded-wallets.json` | Known non-casino contracts (DEX routers/settlement etc.) explicitly denylisted so mis-tags can't inflate any brand. |

## Brand/metric fields (API: `/api/brands`, `/api/stats`)

| Field | Meaning |
|---|---|
| `verified volume` (`volume7d`, `volume24h`) | External-facing flow only: real deposits/withdrawals between an operator and players/exchanges. **Excludes** internal hot-wallet churn (same-operator transfers), casino-to-casino double counts, and flow from `volumeSuspect` operators. This is why our numbers are lower than "raw throughput" trackers. |
| raw volume | Not published as a headline anywhere. Where raw vs verified matters (diagnostics), it's labelled explicitly (`/api/diag/internal-flow`). |
| `inflow7d` / `outflow7d` / `net7d` (net flow) | Deposits in / withdrawals out / difference, over 7 days, in the verified universe. Balanced two-way flow is the healthy pattern; the site never infers insolvency from net flow alone. |
| `reserves` | Sum of stablecoin + major-asset balances across the operator's attributed wallets on every chain we index, priced in USD. A floor, not a claimed total. |
| `reserveCoverage` | How complete our wallet mapping is for the brand — a discrete level, deliberately not a percentage (false precision). A big reserve figure at low coverage means "at least this much", nothing more. |
| `attributed` | `false` = casino-pattern flow with no brand evidence; excluded from verified figures. |
| `trust` (trustScore) | Blend of independent third-party ratings normalised to 0–100 (casino.guru Safety Index, AskGamblers, Trustpilot, editorial). **Requires ≥2 sources**, otherwise `null` (shown as "—"). On-chain health is computed separately (`onchainHealth`) and never mixed in. |
| `confidence` (brand-level) | high / medium / low based on evidence, coverage and rating sources. Low-confidence pages exist but are noindex on-site. |
| `players` | Distinct counterparties (7d) in the verified universe — an on-chain proxy for active depositor reach, not registered users. |
