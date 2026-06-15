import { createPublicClient, http } from "viem";
import { mantle } from "../shared/chains.ts";
import { config, MANTLE_ASSETS } from "../shared/config.ts";
import { sql } from "../db/client.ts";
import type { Adapter } from "./adapters/types.ts";
import { erc20FlowAdapter } from "./adapters/erc20Flow.ts";

// Register adapters. Each RWA/LST asset is one entry in MANTLE_ASSETS.
const adapters: Adapter[] = MANTLE_ASSETS.map((a) =>
  erc20FlowAdapter({ name: a.name, asset: a.asset, address: a.address, decimals: a.decimals })
);

const client = createPublicClient({
  chain: mantle,
  transport: http(config.mantleRpc),
});

const BATCH = 2000n; // blocks per range; tune per RPC limits
const POLL_MS = 15_000;
// On a fresh DB, start this many blocks behind head instead of genesis, so we
// capture recent live flows immediately (Mantle ~2s/block → ~100k ≈ 2-3 days).
const BACKFILL = 100_000n;

async function getLastBlock(name: string, fallback: bigint): Promise<bigint> {
  const rows = await sql`SELECT last_block FROM indexer_state WHERE adapter = ${name}`;
  return rows.length ? BigInt(rows[0].last_block) : fallback;
}

async function setLastBlock(name: string, block: bigint) {
  await sql`
    INSERT INTO indexer_state (adapter, last_block, updated_at)
    VALUES (${name}, ${Number(block)}, now())
    ON CONFLICT (adapter) DO UPDATE SET last_block = ${Number(
      block
    )}, updated_at = now()
  `;
}

async function tick() {
  const head = await client.getBlockNumber();
  for (const a of adapters) {
    const fresh = head > BACKFILL ? head - BACKFILL : a.startBlock;
    const start = a.startBlock > fresh ? a.startBlock : fresh;
    let from = (await getLastBlock(a.name, start)) + 1n;
    if (from > head) continue;
    while (from <= head) {
      const to = from + BATCH - 1n > head ? head : from + BATCH - 1n;
      try {
        await a.index({ client, sql, fromBlock: from, toBlock: to });
        await setLastBlock(a.name, to);
        console.log(`[${a.name}] indexed ${from}-${to}`);
      } catch (err) {
        console.error(`[${a.name}] error ${from}-${to}:`, err);
        break; // retry next tick
      }
      from = to + 1n;
    }
  }
}

console.log("🛰️  Veritas indexer started");
await tick();
setInterval(tick, POLL_MS);
