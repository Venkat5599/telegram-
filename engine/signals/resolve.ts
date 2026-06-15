import { sql } from "../../db/client.ts";
import { config } from "../../shared/config.ts";
import { resolveSignal } from "../../chain/committer.ts";
import { priceOf } from "../price.ts";

// Resolve matured signals against a REAL price move. Each signal predicted a
// direction (long/short) and recorded an entry USD price at commit time. At
// maturity we compare to the current price: a long wins if price rose past a
// threshold, a short wins if it fell. Verifiable, methodology a quant accepts.

const MATURE_MINUTES = 15;
const THRESHOLD = 0.0005; // 0.05% move required to count (filters noise)
const FORCE_HOURS = 2; // after this, resolve on best-effort even if flat

export async function resolveMatured() {
  const pending = await sql<
    {
      id: string;
      payload: any;
      direction: string | null;
      entry_price: string | null;
      commit_tx: string | null;
      onchain_id: string | null;
      mins_old: string;
    }[]
  >`
    SELECT id, payload, direction, entry_price, commit_tx, onchain_id,
           (extract(epoch from now() - created_at) / 60)::int AS mins_old
    FROM signals
    WHERE outcome = 'pending'
      AND created_at < now() - interval '${sql.unsafe(`${MATURE_MINUTES} minutes`)}'
    LIMIT 50
  `;

  let resolved = 0;
  for (const s of pending) {
    const asset = s.payload?.asset as string | undefined;
    const entry = s.entry_price ? Number(s.entry_price) : null;
    const dir = s.direction ?? "long";
    if (!asset || entry == null) {
      // can't price it — skip, leave pending (honest: no fake resolution)
      continue;
    }

    const exit = await priceOf(asset);
    if (exit == null) continue;

    const change = (exit - entry) / entry;
    const moved = Math.abs(change) >= THRESHOLD;
    const forced = Number(s.mins_old) >= FORCE_HOURS * 60;
    // wait for a real move; don't penalize a flat market early
    if (!moved && !forced) continue;
    const won =
      dir === "long" ? change > 0 : change < 0;

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
      SET outcome = ${won ? "won" : "lost"},
          exit_price = ${exit},
          resolve_tx = ${resolveTx},
          resolved_at = now()
      WHERE id = ${s.id}
    `;
    resolved++;
    console.log(
      `⚖️  ${asset} ${dir} entry ${entry} -> exit ${exit} (${(change * 100).toFixed(
        2
      )}%) = ${won ? "WON" : "LOST"}`
    );
  }
  console.log(`⚖️  resolved ${resolved} matured signals`);
  return resolved;
}

if (import.meta.main) {
  await resolveMatured();
  await sql.end();
}
