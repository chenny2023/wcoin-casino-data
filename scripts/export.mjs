#!/usr/bin/env node
// Regenerates data/*.json from wcoin.casino's public read-only API and appends a
// CHANGELOG entry with the diff vs the previous release. This IS the data pipeline —
// no private inputs; anyone can run it and reproduce the files.
//
//   node scripts/export.mjs
//
// Sources:
//   /api/brands?category=casino  → brand grouping, metrics, volumeSuspect(+reasons)
//   /api/labels/export           → per-wallet provenance (source, first_seen) + infra denylist

import { readFileSync, writeFileSync, existsSync } from 'node:fs'

const BASE = process.env.WCOIN_BASE ?? 'https://wcoin.casino'
const UA = { 'User-Agent': 'wcoin-open-data-export/1.0 (+https://github.com/chenny2023/wcoin-casino-data)' }

// Evidence classification derived from the collector that sourced each wallet.
// confidence_score is CLASS-based (documented in DATA_DICTIONARY.md) — we do not
// invent per-wallet precision we don't have.
const EVIDENCE = {
  curated: { evidence_type: 'explorer_name_tag', evidence_source: 'Block-explorer public name tag (curated)', is_seed_wallet: true, cluster_method: null, confidence: 'high', confidence_score: 92 },
  dune: { evidence_type: 'public_label_set', evidence_source: 'Dune labels.addresses (institution)', is_seed_wallet: true, cluster_method: null, confidence: 'high', confidence_score: 88 },
  arkham: { evidence_type: 'entity_intelligence', evidence_source: 'Arkham entity attribution', is_seed_wallet: true, cluster_method: null, confidence: 'medium', confidence_score: 78 },
  'btc-cluster': { evidence_type: 'behavioral_cluster', evidence_source: 'Common-input-ownership expansion from a seed wallet', is_seed_wallet: false, cluster_method: 'common_input_ownership', confidence: 'medium', confidence_score: 62 },
}
const evidenceFor = (source) => EVIDENCE[source] ?? EVIDENCE[String(source).startsWith('arkham') ? 'arkham' : 'curated']

const EXPLORER = {
  ETH: (a) => `https://etherscan.io/address/${a}`,
  TRON: (a) => `https://tronscan.org/#/address/${a}`,
  BSC: (a) => `https://bscscan.com/address/${a}`,
  BASE: (a) => `https://basescan.org/address/${a}`,
  ARB: (a) => `https://arbiscan.io/address/${a}`,
  OP: (a) => `https://optimistic.etherscan.io/address/${a}`,
  POLYGON: (a) => `https://polygonscan.com/address/${a}`,
  AVAX: (a) => `https://snowtrace.io/address/${a}`,
  SOL: (a) => `https://solscan.io/account/${a}`,
  BTC: (a) => `https://mempool.space/address/${a}`,
  SEI: (a) => `https://seitrace.com/address/${a}`,
}
const verifyUrl = (chain, addr) => (EXPLORER[chain] ?? ((a) => null))(addr)

const j = async (path) => {
  const r = await fetch(BASE + path, { headers: UA })
  if (!r.ok) throw new Error(`${path} -> HTTP ${r.status}`)
  return r.json()
}

const brandsRaw = await j('/api/brands?category=casino')
const brands = Array.isArray(brandsRaw) ? brandsRaw : brandsRaw.brands ?? []
const prov = await j('/api/labels/export')
const provByAddr = new Map(prov.wallets.map((w) => [`${w.chain}:${w.address.toLowerCase()}`, w]))

const asOf = prov.as_of.slice(0, 10)
const seed = []
const derived = []
for (const b of brands) {
  if (!b.attributed) continue
  for (const m of b.members ?? []) {
    if (!m.address) continue
    const p = provByAddr.get(`${m.chain}:${m.address.toLowerCase()}`)
    const ev = evidenceFor(p?.source ?? 'curated')
    const row = {
      brand: b.brand,
      label: m.label,
      chain: m.chain,
      address: m.address,
      wallet_role: null, // hot/cold classification not yet derived — never guessed (see DATA_DICTIONARY)
      ...ev,
      evidence_url: verifyUrl(m.chain, m.address),
      first_seen_at: p?.first_seen_at ?? null,
      as_of: asOf,
      volumeSuspect: !!b.volumeSuspect,
      volumeSuspectReasons: b.volumeSuspectReasons ?? [],
    }
    ;(ev.is_seed_wallet ? seed : derived).push(row)
  }
}
const sortKey = (w) => `${w.brand.toLowerCase()}|${w.chain}|${w.address}`
seed.sort((a, b) => sortKey(a).localeCompare(sortKey(b)))
derived.sort((a, b) => sortKey(a).localeCompare(sortKey(b)))

const out = {
  _about:
    'Casino wallets attributed by WCOIN.CASINO. seed_wallets carry direct public evidence (explorer name-tags, public label sets, entity intelligence); derived_wallets were expanded from seeds via common-input-ownership clustering. Every address is independently verifiable via its evidence_url. Confidence scores are evidence-CLASS based (see DATA_DICTIONARY.md). Casino-like wallets we cannot tie to a named brand are excluded from this file entirely (policy: never guessed into a brand).',
  _generated_by: 'scripts/export.mjs (public pipeline — reproducible by anyone)',
  _generated_from: [`${BASE}/api/brands?category=casino`, `${BASE}/api/labels/export`],
  as_of: prov.as_of,
  counts: { brands: new Set([...seed, ...derived].map((w) => w.brand)).size, seed_wallets: seed.length, derived_wallets: derived.length },
  seed_wallets: seed,
  derived_wallets: derived,
}

// ── diff vs previous release for the changelog ───────────────────────────────
const prevPath = 'data/attributed-wallets.json'
let prevAddrs = new Set()
let prevBrands = new Set()
let prevSuspect = new Set()
if (existsSync(prevPath)) {
  try {
    const prev = JSON.parse(readFileSync(prevPath, 'utf8'))
    const prevRows = prev.seed_wallets ? [...prev.seed_wallets, ...prev.derived_wallets] : prev.wallets ?? []
    prevAddrs = new Set(prevRows.map((w) => `${w.chain}:${w.address.toLowerCase()}`))
    prevBrands = new Set(prevRows.map((w) => w.brand))
    prevSuspect = new Set(prevRows.filter((w) => w.volumeSuspect).map((w) => w.brand))
  } catch {}
}
const nowRows = [...seed, ...derived]
const nowAddrs = new Set(nowRows.map((w) => `${w.chain}:${w.address.toLowerCase()}`))
const nowBrands = new Set(nowRows.map((w) => w.brand))
const nowSuspect = new Set(nowRows.filter((w) => w.volumeSuspect).map((w) => w.brand))
const added = [...nowAddrs].filter((a) => !prevAddrs.has(a)).length
const removed = [...prevAddrs].filter((a) => !nowAddrs.has(a)).length
const newBrands = [...nowBrands].filter((b) => !prevBrands.has(b))
const goneBrands = [...prevBrands].filter((b) => !nowBrands.has(b))
const newlySuspect = [...nowSuspect].filter((b) => !prevSuspect.has(b))
const clearedSuspect = [...prevSuspect].filter((b) => !nowSuspect.has(b))

writeFileSync(prevPath, JSON.stringify(out, null, 1))
writeFileSync('data/excluded-wallets.json', JSON.stringify({
  _about: 'Known NON-casino infrastructure (DEX routers/settlement contracts etc.) explicitly excluded from casino attribution. Kept public so exclusions are auditable too.',
  as_of: prov.as_of,
  excluded: prov.excluded,
}, null, 1))

// append changelog entry (newest first, under the header)
const entry = [
  `## ${asOf}`,
  '',
  `- Wallets: ${nowAddrs.size} total (${added ? `+${added} added` : 'no additions'}${removed ? `, −${removed} removed` : ''})`,
  `- Brands: ${nowBrands.size}${newBrands.length ? ` (new: ${newBrands.join(', ')})` : ''}${goneBrands.length ? ` (dropped from active window: ${goneBrands.join(', ')})` : ''}`,
  ...(newlySuspect.length ? [`- Marked **under review** (anomalous volume): ${newlySuspect.join(', ')}`] : []),
  ...(clearedSuspect.length ? [`- Cleared from under-review: ${clearedSuspect.join(', ')}`] : []),
  '',
].join('\n')
const clPath = 'CHANGELOG.md'
const header = '# Data releases\n\nEvery export run appends an entry here (generated by `scripts/export.mjs`). Full line-by-line history is in git.\n\n'
const prevCl = existsSync(clPath) ? readFileSync(clPath, 'utf8').replace(header, '') : ''
writeFileSync(clPath, header + entry + prevCl)

console.log(`wrote data/attributed-wallets.json: ${seed.length} seed + ${derived.length} derived across ${nowBrands.size} brands (as of ${asOf})`)
console.log(`changelog: +${added} / -${removed} wallets; new brands: ${newBrands.length}; under-review changes: +${newlySuspect.length}/-${clearedSuspect.length}`)
