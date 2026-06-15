import { sql } from "../db/client.ts";

// Veritas read API — feeds both the web landing page and B2B consumers.
// Bun.serve, no framework. CORS open for the public scoreboard.

const PORT = Number(process.env.API_PORT ?? 3001);

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json",
      "access-control-allow-origin": "*",
    },
  });
}

Bun.serve({
  port: PORT,
  async fetch(req) {
    const { pathname } = new URL(req.url);

    if (pathname === "/score") {
      const r = await sql`
        SELECT
          COUNT(*) FILTER (WHERE outcome = 'won')  AS wins,
          COUNT(*) FILTER (WHERE outcome IN ('won','lost')) AS total,
          COUNT(*) FILTER (WHERE outcome = 'pending') AS live
        FROM signals
      `;
      const { wins, total, live } = r[0] as any;
      const accuracy = total > 0 ? ((wins / total) * 100).toFixed(1) : "—";
      return json({ accuracy, wins: Number(wins), total: Number(total), live: Number(live) });
    }

    if (pathname === "/signals") {
      const rows = await sql`
        SELECT id, type, payload->>'asset' AS asset, direction,
               entry_price, exit_price, thesis, confidence,
               commit_tx, resolve_tx, outcome, created_at
        FROM signals ORDER BY created_at DESC LIMIT 25
      `;
      return json({ signals: rows });
    }

    if (pathname === "/index") {
      // placeholder until SmartMoneyIndex.sol publishes on-chain
      return json({ value: null, note: "pending on-chain publish" });
    }

    return json({ error: "not found" }, 404);
  },
});

console.log(`🔌 Veritas API on :${PORT}`);
