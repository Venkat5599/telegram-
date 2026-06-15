# Veritas — System Architecture

**Stack:** bun + TypeScript · viem · PostgreSQL · Foundry (Solidity) · grammY (Telegram) · DeepSeek · Next.js (scoreboard)
**Chain:** Mantle (mainnet read / testnet deploy)

---

## 1. High-level diagram

```
                         MANTLE NETWORK
        ┌───────────────────────────────────────────────┐
        │  Merchant Moe · Agni · mETH · fBTC · Bridge    │
        └───────────────────────┬───────────────────────┘
                                 │ logs / events (viem)
                                 ▼
   ┌──────────────────────────────────────────────────────────┐
   │                     INDEXER (bun worker)                   │
   │  protocol adapters → decode events → normalize → Postgres  │
   └───────────────────────┬──────────────────────────────────┘
                           ▼
   ┌──────────────────────────────────────────────────────────┐
   │                     POSTGRES (proprietary store)           │
   │  transfers · pools · wallet_labels · rwa_flows · signals   │
   └───────────┬───────────────────────────────┬──────────────┘
               ▼                                ▼
   ┌────────────────────────┐      ┌──────────────────────────┐
   │  LABELING ENGINE        │      │   SIGNAL ENGINE           │
   │  realized PnL +         │─────▶│   RWA flow · rotation ·   │
   │  behavior clustering    │      │   anomaly detection       │
   └────────────────────────┘      └─────────────┬────────────┘
                                                  ▼
                                    ┌──────────────────────────┐
                                    │  LLM THESIS (DeepSeek)    │
                                    │  signal → plain English   │
                                    └─────────────┬────────────┘
                                                  ▼
              ┌───────────────────────────────────────────────┐
              │           ON-CHAIN COMMITTER (viem)            │
              │  SmartMoneyIndex.sol: commit hash BEFORE       │
              │  outcome → resolver scores → accuracy          │
              │  ERC-8004 IdentityRegistry (agent NFT)         │
              └───────────────┬───────────────────────────────┘
                              ▼
        ┌─────────────────────┴──────────────────────┐
        ▼                                             ▼
┌──────────────────┐                       ┌────────────────────┐
│  TELEGRAM BOT    │                       │  SCOREBOARD (Next)  │
│  grammY          │                       │  accuracy + history │
│  /alpha /score   │                       │  public URL         │
└──────────────────┘                       └────────────────────┘
        ▲                                             ▲
        └──────────────── B2B DATA API (REST) ────────┘
```

## 2. Components

### 2.1 Indexer (`/indexer`)
- bun worker, polls Mantle via viem `getLogs` (or watches blocks).
- **Adapter pattern:** one file per protocol/asset. `adapters/merchantMoe.ts`, `adapters/agni.ts`, `adapters/meth.ts`, `adapters/fbtc.ts`. Adding a protocol = new adapter + config entry (scalability proof — rubric line).
- Decodes events → normalized rows → Postgres.
- Tracks last-indexed block per adapter for resume.

### 2.2 Postgres store (`/db`)
Core tables:
- `transfers` — token, from, to, amount, block, ts.
- `pool_events` — swaps, mints, burns, liquidity.
- `rwa_flows` — mint/redeem for mETH/fBTC, MI4 rebalances, USDY.
- `bridge_inflows` — first-touch new capital.
- `wallet_labels` — address, label, realized_pnl, score, cluster.
- `signals` — id, type, payload, confidence, thesis, commit_tx, outcome, resolved_at.

### 2.3 Labeling engine (`/engine/labeling`)
- Compute realized PnL per wallet from swap/transfer history.
- Cluster by behavior (frequency, hold time, protocol mix).
- Output: "smart money" set (top performers) → `wallet_labels`.
- Runs on schedule (cron in bun).

### 2.4 Signal engine (`/engine/signals`)
Three detectors:
- **rwaFlow.ts** — mint/redeem divergence, depeg pressure, arb windows.
- **rotation.ts** — smart-money capital moving between protocols.
- **anomaly.ts** — LP concentration, redeem spikes, mercenary TVL.
- Each emits a candidate signal with raw evidence + confidence.

### 2.5 LLM thesis (`/engine/thesis`)
- DeepSeek API. Input: signal evidence JSON. Output: investor-grade plain-English thesis + normalized confidence.
- Strict prompt: no hype, cite the numbers, state the actionable.
- Fallback: hackathon $100K AI credits if rate-limited.

### 2.6 On-chain committer (`/chain`)
- viem wallet client (burner key, env-injected).
- **Commit-reveal flow:** hash(signal) written on-chain at emit time → tamper-proof timestamp. Full signal stored off-chain (Postgres) + IPFS optional.
- **Resolver:** after N hours, evaluate outcome (price/flow), write win/loss on-chain → accuracy updates.
- ERC-8004 IdentityRegistry: mint agent identity NFT once; reference in commits.

### 2.7 Telegram bot (`/bot`)
- grammY. Commands: `/alpha`, `/track`, `/score`, `/index`.
- Push alerts on high-confidence signals.
- One-tap Telegram deep-link from the web (zero install, no signup).

### 2.8 Scoreboard (`/web`)
- Next.js → Vercel. Public URL (rubric requires non-localhost).
- Shows: live signals, on-chain commit links, resolved accuracy, Smart Money Index.

### 2.9 B2B API (`/api`)
- REST: `GET /signals`, `GET /labels`, `GET /index`. API-key gated. The revenue surface.

## 3. Smart contracts (`/contracts`, Foundry)

### `SmartMoneyIndex.sol`
```
commitSignal(bytes32 signalHash, uint8 confidence) → emits Committed(id, hash, ts)
resolveSignal(uint256 id, bool won)               → emits Resolved(id, won)
publishIndex(uint256 value, uint256 day)          → daily on-chain index
getAccuracy() view → (wins, total)
```

### ERC-8004 integration
- Use IdentityRegistry (ERC-721) — register agent identity.
- Reputation Registry — optional: publish accuracy as feedback signal.
- Validation Registry — optional: resolver as validator hook.

## 4. Data flow (one signal lifecycle)

1. Indexer writes a mETH redeem spike to `rwa_flows`.
2. Signal engine `rwaFlow.ts` flags it → candidate + evidence.
3. Thesis layer (DeepSeek) → "Large mETH redeem cluster, depeg pressure, confidence 74%."
4. Committer hashes signal → `commitSignal()` on Mantle (timestamp locked).
5. Bot pushes `/alpha` alert + explorer link. Scoreboard updates.
6. After N hours, resolver checks outcome → `resolveSignal()` → accuracy updates on-chain + scoreboard.

## 5. Deployment

- **VPS:** indexer + engine + bot + Postgres + B2B API (pm2 or systemd).
- **Vercel:** scoreboard + B2B API gateway (or both on VPS).
- **Mantle testnet:** contracts (Foundry deploy), verified on Mantle Explorer.
- **Env:** `MANTLE_RPC`, `MANTLE_TESTNET_RPC`, `DEPLOYER_PK`, `TELEGRAM_TOKEN`, `DEEPSEEK_API_KEY`, `DATABASE_URL`.

## 6. Repo structure

```
veritas/
├── contracts/          # Foundry: SmartMoneyIndex.sol, ERC-8004
├── indexer/
│   ├── adapters/       # merchantMoe, agni, meth, fbtc
│   └── index.ts
├── engine/
│   ├── labeling/
│   ├── signals/        # rwaFlow, rotation, anomaly
│   └── thesis/         # DeepSeek
├── chain/              # viem committer + resolver
├── bot/                # grammY Telegram
├── web/                # Next.js scoreboard
├── api/                # B2B REST
├── db/                 # schema + migrations
├── PRD.md
└── ARCHITECTURE.md
```

## 7. Build order (7 days)

- **D1-2:** db schema + indexer + Merchant Moe/Agni/mETH/fBTC adapters.
- **D3:** labeling + signal engine.
- **D4:** DeepSeek thesis layer.
- **D5:** contracts + committer + resolver + ERC-8004 (testnet).
- **D6:** Telegram bot + scoreboard + web deep-link.
- **D7:** demo video, README, deploy, polish, submit.

## 8. Why this architecture scores

- **Proprietary data** = own indexer + Postgres + labeling (Data quality 15).
- **Novel signals** = RWA/rotation/anomaly detectors (Insight value 15).
- **Verifiable** = commit-before-outcome on-chain (Innovation 10 + Excellent unlock).
- **Mantle-native** = RWA/LST focus + on-chain index + ERC-8004 (Ecosystem fit 10).
- **Scalable** = adapter pattern + B2B revenue (Scalability 8 + Business 10).
