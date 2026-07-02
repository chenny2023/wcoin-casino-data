# WCOIN.CASINO — Open Data

Open data & methodology behind **[wcoin.casino](https://wcoin.casino)** — an independent, on-chain intelligence layer for crypto casinos: verified volume, all-chain proof-of-reserves, and blended third-party trust signals.

**Why this repo exists:** a site that asks you to trust its data should show its work. Every attribution we publish traces back to public evidence, and this repo lets anyone audit the inputs, re-verify any address on a block explorer, and diff how the dataset evolves over time (via git history).

## What's here

| File | What it is |
|---|---|
| [`data/attributed-wallets.json`](data/attributed-wallets.json) | Snapshot of casino wallets we attribute to named operators (brand → chain → address). Exported from the live public API. Each address is independently verifiable on its chain's explorer. |
| [`data/curated-labels.json`](data/curated-labels.json) | Hand-curated seed wallets. Every entry carries a **public block-explorer name-tag** (Etherscan/BscScan "public name tag") — nothing here is guessed; open the explorer URL and see the tag yourself. |
| [`data/casino-roster.json`](data/casino-roster.json) | The curated operator roster (brand metadata: chains, license, founded year, house edge where published). |
| [`methodology/`](methodology/) | How each figure is produced — attribution, volume de-distortion, proof-of-reserves, trust scoring — and the known limits of each method. |
| [`API.md`](API.md) | The free, public, read-only JSON API the site itself runs on. No key, no auth. |

## Data sources (attribution evidence classes)

Ranked by strength; a wallet enters the dataset only with at least one of these:

1. **Block-explorer public name-tags** — Etherscan / Tronscan / BscScan publish operator name tags. Strongest public evidence; anyone can re-check it.
2. **Public curated label sets** — e.g. Dune's `labels.addresses` institution labels, community label repositories. Cross-checked before import.
3. **Entity intelligence** (e.g. Arkham entity pages) — used as discovery leads, then corroborated.
4. **On-chain behaviour** — common-input-ownership clustering expanded from a confirmed address (standard heuristic). Cluster-only wallets inherit the cluster's brand *only* when the seed evidence is strong.

Casino-*like* wallets that we can't tie to a named brand are labelled **unattributed** and kept out of every verified figure — never guessed into a brand.

## Honesty rules the dataset follows

- **Verified volume ≠ raw throughput.** We exclude internal hot-wallet churn, casino-to-casino double counts, and wash/treasury-pattern flow. Operators with anomalous volume are held **"Under review"** and never ranked by that volume.
- **Reserves carry a coverage level.** A reserve figure is a floor based on mapped wallets, never a claimed total.
- **No safe/scam verdicts.** We publish verifiable signals; conclusions belong to the reader.
- **Confidence is labelled.** Thin data is marked as such (and de-indexed on the site) rather than dressed up.

## Verify any address yourself

Take any entry from `attributed-wallets.json` and open it on the matching explorer:
Ethereum → `https://etherscan.io/address/<address>` · Tron → `https://tronscan.org/#/address/<address>` · BSC → `https://bscscan.com/address/<address>` · Solana → `https://solscan.io/account/<address>` · Bitcoin → `https://mempool.space/address/<address>`

## Corrections

Found a mis-attributed wallet? Open an issue with the address, chain, and your evidence — corrections are reviewed and applied both here and on the live site. You can also use the on-site correction form.

## License

Data and docs: **CC BY 4.0** — use freely with attribution to `wcoin.casino`.

---
*wcoin.casino is an independent data-media project. It operates no casino, takes no affiliate placement for rankings, and publishes the same figures here and on the site.*
