# Methodology

Full, continuously-updated versions live on the site (linked per section). These are the stable summaries.

## 1. Wallet attribution

A wallet is attributed to an operator only with public, defensible evidence:

1. **Block-explorer public name-tags** (Etherscan/Tronscan/BscScan operator tags) — the seed class.
2. **Public curated label sets** (Dune `labels.addresses` institution labels; community label repos) — imported only for operator-named entries.
3. **Entity intelligence** (e.g. Arkham) — treated as discovery leads and corroborated before use.
4. **Common-input-ownership clustering** — addresses repeatedly co-spent in one transaction share an owner; clusters expand from a confirmed seed. A heuristic, not proof — which is why it never *creates* a brand attribution on its own.

Casino-like wallets without brand evidence stay **unattributed** and are excluded from all verified figures.
Live version: <https://wcoin.casino/methodology/address-attribution>

## 2. Verified volume (de-distortion)

Raw on-chain throughput overstates casino activity. Verified volume excludes:

- **Internal churn** — transfers between wallets of the same operator (precomputed per-transfer internal flag).
- **Casino-to-casino double counts** — one player movement otherwise counted twice.
- **Wash/treasury-pattern flow** — operators whose per-counterparty value or transfer pattern is wildly out of line with genuine player flow (many small transfers) are flagged `volumeSuspect`, shown as **"Under review"**, ranked by trust only, and excluded from all volume rankings.

Live version: <https://wcoin.casino/methodology/on-chain-volume>

## 3. Proof of reserves

Reserves = current balances of stablecoins + major assets across every attributed wallet on every chain we index, priced in USD.

- Published with a **coverage level** (how complete the wallet mapping is), never as a claimed total.
- Read as a **trend** on-site — a snapshot can be dressed up; a trend is harder to fake.
- PoR shows assets, not liabilities: it can never prove full solvency, and we say so everywhere it appears.

Live version: <https://wcoin.casino/methodology/proof-of-reserves>

## 4. Blended trust score

Independent third-party ratings normalised to 0–100 and averaged: casino.guru Safety Index, AskGamblers, Trustpilot, editorial ratings. **Requires ≥2 independent sources** — otherwise no score is shown ("—"). On-chain health is computed separately and never mixed into the trust blend. Rankings default to trust, not volume, because volume is wash-tradeable.

Live version: <https://wcoin.casino/methodology/trust>

## 5. Confidence labelling

Every operator carries a data-confidence grade (high / medium / low) based on evidence class, wallet coverage and rating sources. Low-confidence pages are publicly viewable but **noindex** — thin data is never dressed up as authority.

Live version: <https://wcoin.casino/methodology/data-confidence>
