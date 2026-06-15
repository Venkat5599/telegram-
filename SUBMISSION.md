# Veritas — Demo Flow, Video Script & Submission Checklist

Mantle Turing Test Hackathon 2026 · AI Alpha & Data (Mirana Ventures, Path A).

---

## Live endpoints (judges)

| What | URL |
|------|-----|
| Landing page | http://187.127.137.136:3080 |
| Telegram bot | https://t.me/Subheeksh_bot?start=judge |
| API (proof) | http://187.127.137.136:3001/score · /signals |
| SmartMoneyIndex (contract) | `0x8F8eB4bdd9C53b33296407e4F5939AdF5a384609` (Mantle Sepolia) |
| AgentIdentity / ERC-8004 | `0xe6E95B427fAb972c3Dc4b61c9CA6852A09B7dfF9` (agent #1 `veritas.mantle`) |
| Repo | https://github.com/Venkat5599/telegram- |

---

## THE DEMO FLOW (what a judge experiences)

This is the 60-second path that touches every rubric line:

1. **Open the landing page** → giant "VERIFIABLE ALPHA", live accuracy + signal counts pulled from the API. (UX, Product completeness)
2. **Tap "Open Veritas in Telegram"** → Telegram opens, prompts to start the bot. Zero signup. (UX, lower Web2 barrier)
3. **Type `/alpha`** → live smart-money signals on Mantle RWA/LST flows, each with a DeepSeek-written investor thesis + confidence %. (Insight value, Investment utility)
4. **Click a signal's explorer link** → the on-chain commit on Mantle, timestamped BEFORE the outcome. (Innovation — Verifiable Alpha)
5. **Type `/score`** → verified accuracy, resolved on-chain. Not marketing — math. (the Excellent-tier unlock)
6. **Type `/index`** → the daily Smart Money Index. (Ecosystem contribution)

The story: *"Every other alpha bot asks you to trust it. Veritas proves it — on-chain, before the outcome."*

---

## DEMO VIDEO SCRIPT (target ~2:30, must be >= 2 min)

**[0:00–0:20] Hook + problem.**
> "Every alpha bot on crypto Twitter claims a win rate. None can prove it. And nobody covers the assets that actually define Mantle — its RWA and LST economy: mETH, fBTC. Veritas fixes both."

Screen: landing page hero scroll.

**[0:20–0:50] What it is.**
> "Veritas runs its own indexer over Mantle, decoding RWA/LST flows and labeling smart-money wallets — proprietary data you can't get from an API."

Screen: terminal `pm2 list` (5 services online) + a quick `psql` count of transfers + labeled wallets.

**[0:50–1:30] Live alpha.**
> "Tap one button, the bot opens in Telegram. `/alpha` gives live signals — here, 21 smart-money wallets accumulating mETH — explained in plain English by an on-device DeepSeek model with a confidence score."

Screen: tap landing CTA → Telegram → `/alpha` → show a signal card.

**[1:30–2:10] The moat — verifiable.**
> "Here's the part nobody else does. Every signal is committed to Mantle BEFORE the outcome. Here's that exact signal, on the explorer, timestamped. When it resolves, the win/loss is written on-chain too. `/score` is a track record that physically cannot be faked."

Screen: click explorer link → Mantle Sepolia tx → back to bot `/score`.

**[2:10–2:30] Close.**
> "Proprietary Mantle-native data, an autonomous agent with an ERC-8004 identity, and verifiable alpha. That's Veritas. Live now."

Screen: landing page + contract addresses on screen.

> Tip: pre-run the indexer/brain for a few hours before recording so `/alpha` is full and `/score` shows resolved signals.

---

## DoraHacks submission checklist

DoraHacks AI auto-screens incomplete submissions — fill EVERYTHING.

- [ ] **Public GitHub repo** with README (have: github.com/Venkat5599/telegram-)
- [ ] **Deployed contract address** in submission: `0x8F8eB4bdd9C53b33296407e4F5939AdF5a384609` (Mantle Sepolia)
- [ ] **Demo video >= 2 min** (script above) — upload to YouTube/Loom, link it
- [ ] **Public frontend (not localhost)**: http://187.127.137.136:3080
- [ ] **Live AI function callable on-chain**: signal commit/resolve on SmartMoneyIndex
- [ ] **Project pitch** (use PRD.md problem/solution)
- [ ] **Nominate the AI Alpha & Data track**
- [ ] Architecture overview (ARCHITECTURE.md)

### 20 Project Deployment Award (separate, no judging)
- [x] Smart contract on Mantle (testnet ok)
- [x] Contract **verified** on Mantlescan (https://sepolia.mantlescan.xyz/address/0x8F8eB4bdd9C53b33296407e4F5939AdF5a384609#code)
- [x] AI function callable on-chain
- [x] Frontend publicly accessible
- [ ] Deployment address in submission
- [ ] Demo video >= 2 min

---

## Contract verification (when explorer is back)

Blockscout (no API key):
```
cd contracts
forge verify-contract 0x8F8eB4bdd9C53b33296407e4F5939AdF5a384609 \
  src/SmartMoneyIndex.sol:SmartMoneyIndex \
  --verifier blockscout --verifier-url https://explorer.sepolia.mantle.xyz/api \
  --compiler-version 0.8.24
```
Manual fallback: paste `contracts/flat/SmartMoneyIndex.flat.sol` into the explorer's "Verify & Publish" (Solidity single file, 0.8.24, optimizer on / 200 runs, no constructor args).
