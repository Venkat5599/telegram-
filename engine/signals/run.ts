import { sql } from "../../db/client.ts";
import { config } from "../../shared/config.ts";
import { generateThesis, type SignalEvidence } from "../thesis/index.ts";
import { detectRwaFlow, detectRotation, detectAnomaly } from "./detectors.ts";
import { commitSignal } from "../../chain/committer.ts";
import { priceOf } from "../price.ts";

// Full signal pipeline: detect -> thesis (LLM) -> commit on-chain -> store.
// Dedupes by (type, asset) within the last few hours so we don't spam.

async function recentlySeen(ev: SignalEvidence): Promise<boolean> {
  const rows = await sql`
    SELECT 1 FROM signals
    WHERE type = ${ev.type}
      AND payload->>'asset' = ${ev.asset ?? ""}
      AND created_at > now() - interval '6 hours'
    LIMIT 1
  `;
  return rows.length > 0;
}

export async function runSignals() {
  const candidates: SignalEvidence[] = [
    ...(await detectRwaFlow()),
    ...(await detectRotation()),
    ...(await detectAnomaly()),
  ];

  let created = 0;
  for (const ev of candidates) {
    if (await recentlySeen(ev)) continue;

    const { thesis, confidence } = await generateThesis(ev);
    const entryPrice = ev.asset ? await priceOf(ev.asset) : null;
    const payload = { ...ev, entryPrice, generatedAt: new Date().toISOString() };

    // commit on-chain if contract is deployed; otherwise store unverified
    let commitTx: string | null = null;
    let signalHash: string | null = null;
    let onchainId: string | null = null;
    if (config.smartMoneyIndexAddr && config.deployerPk) {
      try {
        const res = await commitSignal(payload, confidence);
        commitTx = res.txHash;
        signalHash = res.hash;
        onchainId = res.onchainId.toString();
      } catch (e) {
        console.error("commit failed:", (e as Error).message);
      }
    }

    await sql`
      INSERT INTO signals (type, payload, thesis, confidence, direction, entry_price,
                           commit_tx, onchain_id, signal_hash, outcome)
      VALUES (${ev.type}, ${sql.json(payload as any)}, ${thesis}, ${confidence},
              ${ev.direction}, ${entryPrice}, ${commitTx}, ${onchainId}, ${signalHash}, 'pending')
    `;
    created++;
    console.log(`📡 ${ev.type} ${ev.asset ?? ""} (${confidence}%)${commitTx ? " ⛓" : ""}`);
  }

  console.log(`✅ ${created} new signals from ${candidates.length} candidates`);
  return created;
}

if (import.meta.main) {
  await runSignals();
  await sql.end();
}
