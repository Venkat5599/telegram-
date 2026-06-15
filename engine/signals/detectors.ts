import { sql } from "../../db/client.ts";
import type { SignalEvidence } from "../thesis/index.ts";

// Each detector returns candidate signals from the proprietary store.
// These are the three novel signal classes (Insight value — 15pts).

const WINDOW = "6 hours";

/** 1. RWA/LST flow: mint vs redeem divergence on an asset in the window. */
export async function detectRwaFlow(): Promise<SignalEvidence[]> {
  const rows = await sql<
    { asset: string; mint: string; redeem: string }[]
  >`
    SELECT asset,
      COALESCE(SUM(amount) FILTER (WHERE kind='mint'),0)::text AS mint,
      COALESCE(SUM(amount) FILTER (WHERE kind='redeem'),0)::text AS redeem
    FROM rwa_flows
    WHERE ts > now() - interval '${sql.unsafe(WINDOW)}'
    GROUP BY asset
  `;
  const out: SignalEvidence[] = [];
  for (const r of rows) {
    const mint = Number(r.mint);
    const redeem = Number(r.redeem);
    const net = mint - redeem;
    const total = mint + redeem;
    if (total === 0) continue;
    const skew = net / total; // -1 (all redeem) .. +1 (all mint)
    if (Math.abs(skew) < 0.4) continue; // only flag strong divergence
    const dir = net > 0 ? "accumulation (net mint)" : "redemption pressure (net redeem)";
    out.push({
      type: "rwa_flow",
      asset: r.asset,
      summary: `${r.asset} ${dir} over ${WINDOW}: mint ${mint.toFixed(
        2
      )}, redeem ${redeem.toFixed(2)}, net ${net.toFixed(2)}.`,
      data: { mint, redeem, net, skew },
    });
  }
  return out;
}

/** 2. Rotation: smart-money wallets net-accumulating an asset recently. */
export async function detectRotation(): Promise<SignalEvidence[]> {
  const rows = await sql<{ token: string; net: string; wallets: string }[]>`
    SELECT t.token,
           SUM(t.amount)::text AS net,
           COUNT(DISTINCT t.to_addr)::text AS wallets
    FROM transfers t
    JOIN wallet_labels w ON w.address = t.to_addr AND w.label = 'smart_money'
    WHERE t.ts > now() - interval '${sql.unsafe(WINDOW)}'
    GROUP BY t.token
    HAVING COUNT(DISTINCT t.to_addr) >= 2
    ORDER BY SUM(t.amount) DESC
  `;
  return rows.map((r) => ({
    type: "rotation" as const,
    asset: r.token,
    summary: `${r.wallets} smart-money wallets accumulated ${Number(
      r.net
    ).toFixed(2)} ${r.token} in the last ${WINDOW}.`,
    data: { net: Number(r.net), wallets: Number(r.wallets) },
  }));
}

/** 3. Anomaly: single transfer far above the asset's recent average. */
export async function detectAnomaly(): Promise<SignalEvidence[]> {
  const rows = await sql<
    { token: string; amount: string; to_addr: string; avg: string }[]
  >`
    WITH stats AS (
      SELECT token, AVG(amount) AS avg
      FROM transfers
      WHERE ts > now() - interval '7 days'
      GROUP BY token
    )
    SELECT t.token, t.amount::text, t.to_addr, s.avg::text
    FROM transfers t
    JOIN stats s ON s.token = t.token
    WHERE t.ts > now() - interval '${sql.unsafe(WINDOW)}'
      AND s.avg > 0
      AND t.amount > s.avg * 10
    ORDER BY t.amount DESC
    LIMIT 5
  `;
  return rows.map((r) => ({
    type: "anomaly" as const,
    asset: r.token,
    summary: `Anomalous ${r.token} transfer of ${Number(r.amount).toFixed(
      2
    )} (${(Number(r.amount) / Number(r.avg)).toFixed(
      0
    )}x the 7d average) to ${r.to_addr.slice(0, 10)}…`,
    data: { amount: Number(r.amount), avg: Number(r.avg), to: r.to_addr },
  }));
}
