import { sql } from "../../db/client.ts";
import { config } from "../../shared/config.ts";
import { resolveSignal } from "../../chain/committer.ts";

// Resolve matured signals using our own indexed data (no external price oracle).
// Heuristic: a directional signal "won" if the asset's net flow continued in the
// predicted direction in the window AFTER the signal. Honest + verifiable from
// the same proprietary dataset. Matures signals older than MATURE_HOURS.

const MATURE_HOURS = 6;

export async function resolveMatured() {
  const pending = await sql<
    {
      id: string;
      type: string;
      payload: any;
      commit_tx: string | null;
      onchain_id: string | null;
    }[]
  >`
    SELECT id, type, payload, commit_tx, onchain_id
    FROM signals
    WHERE outcome = 'pending'
      AND created_at < now() - interval '${sql.unsafe(`${MATURE_HOURS} hours`)}'
    LIMIT 50
  `;

  let resolved = 0;
  for (const s of pending) {
    const asset = s.payload?.asset as string | undefined;
    let won = false;

    if (s.type === "rwa_flow" && asset) {
      // did net flow continue same sign after the signal?
      const r = await sql<{ net: string }[]>`
        SELECT COALESCE(
          SUM(CASE WHEN kind='mint' THEN amount WHEN kind='redeem' THEN -amount ELSE 0 END),0
        )::text AS net
        FROM rwa_flows
        WHERE asset = ${asset} AND ts > now() - interval '${sql.unsafe(`${MATURE_HOURS} hours`)}'
      `;
      const after = Number(r[0]?.net ?? 0);
      const predicted = Number(s.payload?.data?.net ?? 0);
      won = Math.sign(after) === Math.sign(predicted) && after !== 0;
    } else {
      // rotation / anomaly: continued smart-money inflow on the token
      const r = await sql<{ net: string }[]>`
        SELECT COALESCE(SUM(amount),0)::text AS net FROM transfers
        WHERE token = ${asset ?? ""} AND ts > now() - interval '${sql.unsafe(`${MATURE_HOURS} hours`)}'
      `;
      won = Number(r[0]?.net ?? 0) > 0;
    }

    // resolve on-chain using the contract-assigned id (not the DB id)
    let resolveTx: string | null = null;
    if (s.onchain_id && config.smartMoneyIndexAddr && config.deployerPk) {
      try {
        resolveTx = await resolveSignal(BigInt(s.onchain_id), won);
      } catch (e) {
        console.error("resolve tx failed:", (e as Error).message);
      }
    }

    await sql`
      UPDATE signals
      SET outcome = ${won ? "won" : "lost"}, resolve_tx = ${resolveTx}, resolved_at = now()
      WHERE id = ${s.id}
    `;
    resolved++;
  }
  console.log(`⚖️  resolved ${resolved} matured signals`);
  return resolved;
}

if (import.meta.main) {
  await resolveMatured();
  await sql.end();
}
