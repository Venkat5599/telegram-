# Veritas — Product Requirements Document

**Tagline:** Verifiable smart-money intelligence for the Mantle economy.
**Track:** AI Alpha & Data (Mantle Turing Test Hackathon 2026) — Mirana Ventures, Path A (Data & Analytics).
**One line:** The Nansen for Mantle's RWA/LST flows — proprietary on-chain intelligence, every signal verifiable on-chain, delivered via Telegram.

---

## 1. Problem

Mantle's thesis is RWA + LSTs (mETH, cmETH, fBTC, MI4, USDY). That economy generates rich on-chain flow data — and **no intelligence layer reads it**. Generic tools (Nansen, Arkham, DeBank) underserve Mantle and ignore its RWA/LST assets entirely. Investors and traders fly blind on the assets that define the chain.

At the same time, every "alpha bot" makes claims nobody can verify. There is no fact-based track record — only marketing.

Two gaps, one product:
1. **No Mantle-native intelligence** on the flows that matter (RWA/LST + smart-money rotation).
2. **No verifiable alpha** — signals are unprovable.

## 2. Solution

Veritas runs a **proprietary Mantle indexer** that decodes major protocols + RWA/LST contracts, labels wallets by realized behavior, and detects three signal classes nobody else surfaces. Each signal is:
- Explained in plain English by an LLM (investor-grade thesis).
- **Committed on-chain *before* outcome**, then auto-resolved → a public, un-fakeable accuracy score.
- Delivered via Telegram (zero-install, no signup) + a public scoreboard.

The agent carries an **ERC-8004 identity** and writes a daily **Smart Money Index on-chain**.

## 3. Target users

- **Primary:** Mantle DeFi traders / degens wanting early, trustworthy alpha (Telegram).
- **Secondary (revenue):** Funds, protocols, market makers needing Mantle flow data (B2B API). This is Mirana's lens — "would a professional investor use this?"

## 4. Core signals (the moat — what nobody else has)

1. **RWA/LST flow intelligence** — decode mETH/cmETH/fBTC mint↔redeem, MI4 rebalances, USDY flows. Detect depeg pressure + arbitrage windows before price reacts.
2. **Smart-money rotation graph** — labeled wallets rotating capital between Merchant Moe ↔ Agni ↔ Fluxion. "Where smart money goes next."
3. **First-touch bridge intelligence** — new capital bridging into Mantle and what it buys first (earliest possible signal).

Plus **anomaly detection**: abnormal LP concentration (rug risk), redeem spikes, mercenary-vs-sticky TVL.

## 5. Features (MVP scope, 7 days)

| # | Feature | Priority |
|---|---------|----------|
| F1 | Mantle indexer: 2 protocols (Merchant Moe, Agni) + 2 RWA assets (mETH, fBTC) | P0 |
| F2 | Wallet labeling: realized PnL + behavior clustering → "smart money" set | P0 |
| F3 | Signal engine: RWA flow + rotation + anomaly detection | P0 |
| F4 | LLM thesis layer (DeepSeek) → plain-English signal + confidence | P0 |
| F5 | `SmartMoneyIndex.sol`: commit signal hash on-chain before outcome | P0 |
| F6 | Auto-resolution: score signal outcome on-chain → accuracy | P0 |
| F7 | ERC-8004 agent identity NFT | P0 |
| F8 | Telegram bot: `/alpha`, `/track`, `/score`, push alerts | P0 |
| F9 | Public scoreboard page (Next.js) — accuracy + signal history | P0 |
| F10 | One-tap Telegram deep-link from web (zero install) | P0 ✅ |
| F11 | B2B data API endpoint (read signals/labels) | P1 |
| F12 | Add 3rd protocol via config-only adapter (scalability proof) | P1 |

## 6. Telegram commands

- `/alpha` — top live signals now (thesis + confidence + on-chain link).
- `/track <wallet>` — follow a wallet, get its moves.
- `/score` — Veritas verified accuracy (on-chain).
- `/index` — current on-chain Smart Money Index.
- alerts — push on high-confidence signals.

## 7. Success metrics (demo-day proof)

- ≥ 20 signals committed on-chain during hackathon window.
- Verifiable accuracy score live on scoreboard.
- ≥ 2 protocols + 2 RWA assets indexed end-to-end.
- Public URL (not localhost) + verified contract on Mantle Explorer.
- Demo video ≥ 2 min hitting every rubric line.

## 8. Rubric mapping (target: 100/100)

**Part A — Mantle general (50)**
- Technical 15 → full pipeline live on Mantle.
- Ecosystem fit 10 → RWA/LST native, on-chain index, ERC-8004.
- Business 10 → consumer subs + B2B data API.
- Innovation 10 → verifiable on-chain track record.
- UX 5 → Telegram, zero-install, one-tap from web.

**Part B — Mirana Path A · Data & Analytics (50)**
- Insight value 15 → 3 novel signal classes.
- Data source quality 15 → proprietary Mantle indexer + labeling.
- Investment utility 12 → early, actionable smart-money flows.
- Scalability 8 → modular adapters + B2B funding model.

**Excellent-tier unlock:** "Verifiable Alpha" (grade box language) = signals proven on-chain.

## 9. Risks & mitigations

| Risk | Mitigation |
|------|-----------|
| Indexer not truly proprietary → caps at Average | Run own indexer; never wrap public API. |
| Scope creep (8 protocols shallow) | 2 protocols + 2 RWA done deeply. |
| Demo breaks live | Pre-seed resolved signals; record fallback video. |
| Incomplete DoraHacks submission → auto-filtered | Complete repo + video + deployed address early. |
| DeepSeek rate/quality | Fall back to hackathon $100K AI credits. |

## 10. Revenue / GTM (post-hackathon)

- **Consumer:** Telegram subscription tiers (free signals delayed, paid real-time).
- **B2B:** Mantle flow-data API for funds/protocols/MMs.
- **Wedge:** Mantle has no native intelligence layer. Veritas becomes it.

## 11. Out of scope (v1)

- Auto-execution / live trading (Path B territory — not this track).
- Multi-chain (Mantle-only by design; cross-chain = scalability story, not v1).
- Mobile app (Telegram is the surface).
