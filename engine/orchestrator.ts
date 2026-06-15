import { runLabeling } from "./labeling/run.ts";
import { runSignals } from "./signals/run.ts";
import { resolveMatured } from "./signals/resolve.ts";

// Single long-running brain: relabel, detect new signals, resolve matured ones.
const INTERVAL_MS = 5 * 60 * 1000; // every 5 min

async function cycle() {
  try {
    await runLabeling();
    await runSignals();
    await resolveMatured();
  } catch (e) {
    console.error("orchestrator cycle error:", (e as Error).message);
  }
}

console.log("🧠 Veritas orchestrator started");
await cycle();
setInterval(cycle, INTERVAL_MS);
