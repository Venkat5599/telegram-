# Veritas

> Verifiable smart-money intelligence for the Mantle economy.
> The Nansen for Mantle's RWA/LST flows — proprietary on-chain intelligence, every signal verifiable on-chain, delivered via Telegram.

Mantle Turing Test Hackathon 2026 · AI Alpha & Data track (Mirana Ventures).

See [PRD.md](./PRD.md) and [ARCHITECTURE.md](./ARCHITECTURE.md).

## Stack

bun · TypeScript · viem · PostgreSQL · Foundry · grammY · DeepSeek · Next.js

## Setup

```bash
# 1. install
bun install

# 2. env
cp .env.example .env   # fill DEEPSEEK_API_KEY; bot token + testnet pk already set

# 3. database (local Postgres or Neon)
createdb veritas
bun run db:migrate

# 4. run the moat — indexer
bun run indexer

# 5. run the bot
bun run bot
```

## Components

| Cmd | What |
|-----|------|
| `bun run indexer` | Mantle indexer (RWA/LST flows — the moat) |
| `bun run labeling` | wallet labeling (realized PnL + clustering) |
| `bun run signals` | signal engine (rwa flow / rotation / anomaly) |
| `bun run bot` | Telegram bot |
| `bun run api` | B2B data API |
| `bun run db:migrate` | apply schema |

## Status

- [x] PRD + Architecture
- [x] Indexer skeleton + adapter pattern + mETH adapter
- [x] DB schema (proprietary store)
- [x] Telegram bot skeleton
- [ ] More adapters (Agni, Merchant Moe, fBTC)
- [ ] Labeling engine
- [ ] Signal engine + DeepSeek thesis
- [ ] `SmartMoneyIndex.sol` + ERC-8004 + committer/resolver
- [ ] Scoreboard (Next.js)

## Security

`.env` is gitignored. The testnet private key is **testnet-only** — never fund on mainnet. Rotate the Telegram token after the event.
