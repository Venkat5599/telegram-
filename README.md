<p align="center">
  <img src="https://img.shields.io/badge/◆-Veritas-65f0c0?style=for-the-badge&labelColor=0a0f12" alt="Veritas" />
</p>

<h1 align="center">Veritas</h1>

<p align="center">
  <strong>Verifiable Smart-Money Intelligence for the Mantle Economy</strong>
</p>

<p align="center">
  <em>The Nansen for Mantle's RWA &amp; LST flows — every alpha signal committed on-chain <u>before</u> the outcome, so the track record can't be faked.</em>
</p>

<p align="center">
  <a href="https://veritas-venkat5599s-projects.vercel.app">
    <img src="https://img.shields.io/badge/🟢_LIVE-Landing_Page-65f0c0?style=for-the-badge" alt="Live" />
  </a>
  <a href="https://t.me/Subheeksh_bot?start=judge">
    <img src="https://img.shields.io/badge/Telegram-@Subheeksh__bot-229ED9?style=for-the-badge&logo=telegram" alt="Telegram" />
  </a>
  <img src="https://img.shields.io/badge/Mantle-Sepolia-000000?style=for-the-badge" alt="Mantle" />
  <img src="https://img.shields.io/badge/Solidity-0.8.24-363636?style=for-the-badge&logo=solidity" alt="Solidity" />
</p>

---

## 📋 Project Overview

**Veritas** is an autonomous on-chain intelligence agent for the **Mantle** network. It runs its own indexer over Mantle's RWA/LST economy (mETH, fBTC, cmETH, USDY), labels smart-money wallets, detects alpha signals — and **commits every prediction to the blockchain before the outcome is known**, then resolves win/loss on-chain.

The result is a smart-money intelligence feed whose accuracy is **provable, not marketing.**

### What It Does

- **Indexes Mantle RWA/LST flows** — own indexer, proprietary dataset (not a public API)
- **Labels smart money** — USD-weighted accumulation ranking across all tracked assets
- **Detects alpha** — smart-money rotation, RWA mint/redeem divergence, anomalous transfers
- **Explains it** — plain-English investor thesis + confidence + direction (LONG/SHORT) via DeepSeek
- **Proves it** — every signal hashed and committed on-chain *before* the outcome, then resolved against real price
- **Delivers it** — one-tap Telegram bot, no signup, plus a public web dashboard

### Key Innovation

Every other alpha bot says *"trust me, I'm 80% accurate."* Unverifiable.

Veritas commits each signal to a Mantle smart contract **before** the result, then writes the win/loss on-chain when it resolves. The track record is enforced by the blockchain itself.

```
Traditional alpha bot:  Signal → Telegram → "trust me"        (unverifiable)
Veritas:                Signal → on-chain commit → outcome → on-chain resolve → provable accuracy
```

---

## 🌐 Why This Matters for Mantle

Mantle's identity is its RWA + LST economy — mETH, fBTC, cmETH, USDY. That economy generates rich on-chain flow data that **no intelligence layer reads**. Generic tools (Nansen, Arkham) underserve Mantle and ignore its RWA/LST assets.

| Benefit | Impact |
|---------|--------|
| **Mantle-native intelligence** | Deep coverage of the RWA/LST assets that define the chain |
| **Verifiable alpha** | On-chain track record — the first benchmark of agent prediction quality on Mantle |
| **ERC-8004 identity** | Agent carries a portable on-chain identity, building reputation in the ecosystem |
| **B2B data layer** | Proprietary Mantle flow data — a fundable product, not a toy |

Built for the **Turing Test Hackathon 2026 · AI Alpha & Data track** (Mirana Ventures).

---

## 🚀 Live Deployment

### Endpoints

| Resource | URL |
|----------|-----|
| **Landing page (Vercel)** | https://veritas-venkat5599s-projects.vercel.app |
| **Landing page (VPS)** | http://187.127.137.136:3080 |
| **Telegram bot** | https://t.me/Subheeksh_bot |
| **Read / B2B API** | http://187.127.137.136:3001/score · /signals · /index |

### Smart Contracts — Mantle Sepolia

| Contract | Address |
|----------|---------|
| **SmartMoneyIndex** | [`0x8F8eB4bdd9C53b33296407e4F5939AdF5a384609`](https://explorer.sepolia.mantle.xyz/address/0x8F8eB4bdd9C53b33296407e4F5939AdF5a384609) |
| **AgentIdentity (ERC-8004)** | [`0xe6E95B427fAb972c3Dc4b61c9CA6852A09B7dfF9`](https://explorer.sepolia.mantle.xyz/address/0xe6E95B427fAb972c3Dc4b61c9CA6852A09B7dfF9) |

```
Network:   Mantle Sepolia
Chain ID:  5003
RPC URL:   https://rpc.sepolia.mantle.xyz
Explorer:  https://explorer.sepolia.mantle.xyz
```

---

## 🤖 Using the Bot

Tap **[Open Veritas in Telegram](https://t.me/Subheeksh_bot?start=judge)** — no install, no signup.

| Command | What it does |
|---------|--------------|
| `/alpha` | Latest smart-money signals + thesis + confidence + status (✅ won / ❌ lost / ⏳ live) + on-chain link |
| `/score` | Verified accuracy — wins/total resolved on-chain |
| `/index` | Smart Money Index — tracked wallets + net USD accumulation |
| `/track 0x…` | Any wallet's label, USD score, and recent RWA/LST moves |

---

## 🏗️ Architecture

```
                         MANTLE NETWORK
        ┌───────────────────────────────────────────────┐
        │      mETH · fBTC · cmETH · USDY (RWA/LST)       │
        └───────────────────────┬───────────────────────┘
                                 │ events (viem)
                                 ▼
   ┌──────────────────────────────────────────────────────────┐
   │  INDEXER  → adapter per asset → normalize → PostgreSQL     │
   └───────────────────────┬──────────────────────────────────┘
                           ▼
   ┌────────────────────────┐      ┌──────────────────────────┐
   │  LABELING ENGINE        │─────▶│   SIGNAL DETECTORS        │
   │  USD-weighted ranking   │      │   rotation · rwa_flow ·   │
   │  → smart_money cohort   │      │   anomaly  (+ direction)  │
   └────────────────────────┘      └─────────────┬────────────┘
                                                  ▼
                                    ┌──────────────────────────┐
                                    │  THESIS (DeepSeek v4)     │
                                    └─────────────┬────────────┘
                                                  ▼
              ┌───────────────────────────────────────────────┐
              │  ON-CHAIN COMMITTER (viem)                     │
              │  commit hash BEFORE outcome → resolve vs price │
              │  SmartMoneyIndex.sol + ERC-8004 identity       │
              └───────────────┬───────────────────────────────┘
                              ▼
        ┌─────────────────────┴──────────────────────┐
        ▼                                             ▼
┌──────────────────┐                       ┌────────────────────┐
│  TELEGRAM BOT    │                       │  WEB + B2B API      │
│  /alpha /score   │                       │  live accuracy feed │
└──────────────────┘                       └────────────────────┘
```

The **resolver** scores each matured signal against a real USD price move (CoinGecko), waiting for a genuine move before deciding win/loss — and writes the result on-chain.

See [ARCHITECTURE.md](./ARCHITECTURE.md) and [PRD.md](./PRD.md) for the full design.

---

## 🛠️ Tech Stack

- **Runtime:** Bun + TypeScript
- **Chain:** viem · Foundry (Solidity 0.8.24) · Mantle Sepolia
- **Data:** PostgreSQL (proprietary indexed store)
- **AI:** DeepSeek v4 Flash (OpenAI-compatible) for signal theses
- **Bot:** grammY (Telegram)
- **Web:** Next.js 15 + Tailwind + Framer Motion + Lenis
- **Ops:** pm2 on Ubuntu VPS · Vercel (landing)

---

## 📁 Project Structure

```
veritas/
├── contracts/          # Foundry: SmartMoneyIndex.sol, AgentIdentity.sol (ERC-8004)
├── indexer/            # Mantle indexer + per-asset adapters (erc20Flow factory)
├── engine/
│   ├── labeling/       # USD-weighted smart-money ranking
│   ├── signals/        # detectors, runner, resolver
│   ├── thesis/         # DeepSeek thesis layer
│   ├── price.ts        # USD price source (resolution + labeling)
│   └── orchestrator.ts # 5-min brain loop
├── chain/              # viem committer + resolver + ABI
├── bot/                # grammY Telegram bot
├── api/                # Bun.serve read / B2B API
├── web/                # Next.js landing + live dashboard
└── db/                 # schema + migrations
```

---

## 🧑‍💻 Run Locally

```bash
# install
bun install

# env
cp .env.example .env        # fill DEEPSEEK_API_KEY, LLM_BASE_URL, DEPLOYER_PK, TELEGRAM_TOKEN

# database
createdb veritas && bun run db:migrate

# services
bun run indexer        # index Mantle RWA/LST flows
bun run orchestrator   # label → detect → thesis → commit → resolve (every 5 min)
bun run api            # read / B2B API
bun run bot            # Telegram bot
cd web && bun run dev  # landing page
```

Deploy all services on a VPS with pm2: `pm2 start ecosystem.config.cjs`.

---

## 🗺️ Roadmap

- [x] Mantle indexer + 4 RWA/LST asset adapters (mETH, fBTC, cmETH, USDY)
- [x] USD-weighted smart-money labeling
- [x] Signal detectors (rotation, RWA flow, anomaly) + DeepSeek theses
- [x] On-chain commit-before-outcome + price-based resolution
- [x] ERC-8004 agent identity
- [x] Telegram bot + public web dashboard + B2B API
- [x] Deployed live (VPS + Vercel + Mantle Sepolia)
- [ ] Verify contracts on explorer
- [ ] More assets + DEX (Merchant Moe, Agni) adapters
- [ ] Longer resolution horizons + risk-adjusted scoring

---

<div align="center">

## Built for the Turing Test Hackathon 2026

**AI Alpha &amp; Data Track · Mantle**

*Verifiable alpha — every other bot asks you to trust it; Veritas proves it on-chain.*

</div>
