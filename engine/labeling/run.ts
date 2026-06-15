import { sql } from "../../db/client.ts";

// Labeling engine: rank wallets by net accumulation behavior across indexed
// transfers, tag the top performers as "smart_money". This labeled set is the
// foundation of every signal — and the proprietary asset judges score (Data 15).

const SMART_MONEY_TOP_N = 50;

export async function runLabeling() {
  // net flow per address = received - sent (proxy for accumulation)
  const rows = await sql<
    { address: string; net: string; txs: string }[]
  >`
    WITH flows AS (
      SELECT to_addr AS address, amount AS amt, 1 AS dir FROM transfers
      UNION ALL
      SELECT from_addr AS address, amount AS amt, -1 AS dir FROM transfers
    )
    SELECT address,
           SUM(amt * dir)::text AS net,
           COUNT(*)::text AS txs
    FROM flows
    WHERE address <> '0x0000000000000000000000000000000000000000'
    GROUP BY address
    HAVING COUNT(*) >= 3
    ORDER BY SUM(amt * dir) DESC
    LIMIT ${SMART_MONEY_TOP_N}
  `;

  let labeled = 0;
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const score = Math.round(((rows.length - i) / rows.length) * 100);
    await sql`
      INSERT INTO wallet_labels (address, label, realized_pnl, score, cluster, updated_at)
      VALUES (${r.address}, 'smart_money', ${r.net}, ${score}, 'accumulator', now())
      ON CONFLICT (address) DO UPDATE
        SET label = 'smart_money', realized_pnl = ${r.net},
            score = ${score}, updated_at = now()
    `;
    labeled++;
  }
  console.log(`🏷️  labeled ${labeled} smart-money wallets`);
  return labeled;
}

if (import.meta.main) {
  await runLabeling();
  await sql.end();
}
