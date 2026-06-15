import { sql } from "../../db/client.ts";
import { getPrices } from "../price.ts";

// Labeling engine. Scores wallets by USD-weighted net accumulation across all
// indexed RWA/LST assets (cross-asset comparable), then tags the top cohort as
// smart_money. USD weighting means 1 fBTC (~$66k) is not treated like 1 mETH
// (~$1.9k) — the methodology a quant investor expects. The labeled set + per-
// wallet USD basis is the proprietary asset judges score (Data quality 15).

const SMART_MONEY_TOP_N = 50;

export async function runLabeling() {
  const prices = await getPrices();
  // build a CASE expression to weight each token by its USD price
  const known = Object.keys(prices);
  if (known.length === 0) {
    console.log("🏷️  no prices yet — skipping labeling cycle");
    return 0;
  }
  const caseExpr = known
    .map((t) => `WHEN token = '${t}' THEN ${prices[t]}`)
    .join(" ");

  const rows = await sql<
    { address: string; usd_net: string; txs: string }[]
  >`
    WITH flows AS (
      SELECT to_addr AS address, amount AS amt, 1 AS dir, token FROM transfers
      UNION ALL
      SELECT from_addr AS address, amount AS amt, -1 AS dir, token FROM transfers
    )
    SELECT address,
           SUM(amt * dir * (CASE ${sql.unsafe(caseExpr)} ELSE 0 END))::text AS usd_net,
           COUNT(*)::text AS txs
    FROM flows
    WHERE address <> '0x0000000000000000000000000000000000000000'
    GROUP BY address
    HAVING COUNT(*) >= 3
    ORDER BY SUM(amt * dir * (CASE ${sql.unsafe(caseExpr)} ELSE 0 END)) DESC
    LIMIT ${SMART_MONEY_TOP_N}
  `;

  let labeled = 0;
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const score = Math.round(((rows.length - i) / rows.length) * 100);
    await sql`
      INSERT INTO wallet_labels (address, label, realized_pnl, score, cluster, updated_at)
      VALUES (${r.address}, 'smart_money', ${r.usd_net}, ${score}, 'usd_accumulator', now())
      ON CONFLICT (address) DO UPDATE
        SET label = 'smart_money', realized_pnl = ${r.usd_net},
            score = ${score}, cluster = 'usd_accumulator', updated_at = now()
    `;
    labeled++;
  }
  console.log(`🏷️  labeled ${labeled} smart-money wallets (USD-weighted)`);
  return labeled;
}

if (import.meta.main) {
  await runLabeling();
  await sql.end();
}
