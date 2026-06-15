import { sql } from "../../db/client.ts";
import { config } from "../../shared/config.ts";
import { generateThesis, type SignalEvidence } from "../thesis/index.ts";
import { detectRwaFlow, detectRotation, detectAnomaly } from "./detectors.ts";
import { commitSignal, hashSignal } from "../../chain/committer.ts";

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
    const payload = { ...ev, generatedAt: new Date().toISOString() };

    // commit on-chain if contract is deployed; otherwise store unverified
    let commitTx: string | null = null;
    let signalHash: string | null = null;
    if (config.smartMoneyIndexAddr && config.deployerPk) {
      try {
        commitTx = await commitSignal(payload, confidence);
        signalHash = hashSignal(payload);
      } catch (e) {
        console.error("commit failed:", (e as Error).message);
      }
    }

    await sql`
      INSERT INTO signals (type, payload, thesis, confidence, commit_tx, signal_hash, outcome)
      VALUES (${ev.type}, ${sql.json(payload as any)}, ${thesis}, ${confidence},
              ${commitTx}, ${signalHash}, 'pending')
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
