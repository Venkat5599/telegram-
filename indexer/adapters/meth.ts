import { parseAbiItem, getAddress, formatUnits } from "viem";
import type { Adapter } from "./types.ts";
import { MANTLE_ASSETS } from "../../shared/config.ts";

// mETH RWA/LST flow adapter — the differentiator.
// We treat ERC-20 Transfers from/to the zero address as mint/redeem proxies,
// plus transfers to/from the staking contract. Refine with the real
// stake/unstake event signatures once verified on Mantle Explorer.
const ZERO = "0x0000000000000000000000000000000000000000";
const transferEvent = parseAbiItem(
  "event Transfer(address indexed from, address indexed to, uint256 value)"
);

export const methAdapter: Adapter = {
  name: "meth",
  startBlock: 0n, // set to mETH deploy block to speed initial sync
  async index({ client, sql, fromBlock, toBlock }) {
    const logs = await client.getLogs({
      address: getAddress(MANTLE_ASSETS.mETH),
      event: transferEvent,
      fromBlock,
      toBlock,
    });

    for (const log of logs) {
      const { from, to, value } = log.args as {
        from: `0x${string}`;
        to: `0x${string}`;
        value: bigint;
      };
      const amount = formatUnits(value, 18);
      const block = await client.getBlock({ blockNumber: log.blockNumber! });
      const ts = new Date(Number(block.timestamp) * 1000);

      // mint = from zero, redeem = to zero
      const kind = from === ZERO ? "mint" : to === ZERO ? "redeem" : null;
      if (kind) {
        const actor = kind === "mint" ? to : from;
        await sql`
          INSERT INTO rwa_flows (asset, kind, actor, amount, block, tx_hash, ts)
          VALUES ('mETH', ${kind}, ${actor}, ${amount}, ${Number(
          log.blockNumber
        )}, ${log.transactionHash}, ${ts})
          ON CONFLICT DO NOTHING
        `;
      }

      // always record the raw transfer (feeds labeling + rotation)
      await sql`
        INSERT INTO transfers (token, from_addr, to_addr, amount, block, tx_hash, ts)
        VALUES ('mETH', ${from}, ${to}, ${amount}, ${Number(
        log.blockNumber
      )}, ${log.transactionHash}, ${ts})
        ON CONFLICT DO NOTHING
      `;
    }
  },
};
