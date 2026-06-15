import { parseAbiItem, getAddress, formatUnits } from "viem";
import type { Adapter } from "./types.ts";

// Generic RWA/LST flow adapter. Indexes ERC-20 Transfers for an asset and
// derives mint/redeem (transfers from/to the zero address) — the RWA flow
// intelligence that is the moat. Adding an asset = one factory call.

const ZERO = "0x0000000000000000000000000000000000000000";
const transferEvent = parseAbiItem(
  "event Transfer(address indexed from, address indexed to, uint256 value)"
);

export function erc20FlowAdapter(opts: {
  name: string; // adapter key
  asset: string; // display symbol, e.g. mETH
  address: string;
  decimals: number;
  startBlock?: bigint;
}): Adapter {
  return {
    name: opts.name,
    startBlock: opts.startBlock ?? 0n,
    async index({ client, sql, fromBlock, toBlock }) {
      const logs = await client.getLogs({
        address: getAddress(opts.address),
        event: transferEvent,
        fromBlock,
        toBlock,
      });
      if (logs.length === 0) return;

      // batch block timestamps (avoid one getBlock per log)
      const blockNums = [...new Set(logs.map((l) => l.blockNumber!))];
      const tsByBlock = new Map<bigint, Date>();
      for (const bn of blockNums) {
        const b = await client.getBlock({ blockNumber: bn });
        tsByBlock.set(bn, new Date(Number(b.timestamp) * 1000));
      }

      for (const log of logs) {
        const { from, to, value } = log.args as {
          from: `0x${string}`;
          to: `0x${string}`;
          value: bigint;
        };
        const amount = formatUnits(value, opts.decimals);
        const ts = tsByBlock.get(log.blockNumber!)!;
        const blk = Number(log.blockNumber);

        const kind = from === ZERO ? "mint" : to === ZERO ? "redeem" : null;
        if (kind) {
          const actor = kind === "mint" ? to : from;
          await sql`
            INSERT INTO rwa_flows (asset, kind, actor, amount, block, tx_hash, ts)
            VALUES (${opts.asset}, ${kind}, ${actor}, ${amount}, ${blk}, ${log.transactionHash}, ${ts})
            ON CONFLICT DO NOTHING
          `;
        }
        await sql`
          INSERT INTO transfers (token, from_addr, to_addr, amount, block, tx_hash, ts)
          VALUES (${opts.asset}, ${from}, ${to}, ${amount}, ${blk}, ${log.transactionHash}, ${ts})
          ON CONFLICT DO NOTHING
        `;
      }
    },
  };
}
