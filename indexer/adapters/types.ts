import type { PublicClient } from "viem";
import type { Sql } from "postgres";

export interface Adapter {
  /** unique adapter key, used for indexer_state */
  name: string;
  /** earliest block to index from (deploy block) */
  startBlock: bigint;
  /**
   * Index a block range. Decode events, write normalized rows.
   * Adding a new protocol = implement this once. (Scalability — 8pts)
   */
  index(args: {
    client: PublicClient;
    sql: Sql;
    fromBlock: bigint;
    toBlock: bigint;
  }): Promise<void>;
}
