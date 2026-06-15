import { Bot } from "grammy";
import { config } from "../shared/config.ts";
import { sql } from "../db/client.ts";

if (!config.telegramToken) throw new Error("TELEGRAM_TOKEN missing");
const bot = new Bot(config.telegramToken);

bot.command("start", (ctx) => {
  // deep-link payload, e.g. t.me/Subheeksh_bot?start=judge
  const payload = ctx.match?.toString().trim();
  const greet =
    payload === "judge"
      ? "👋 Welcome, judge. You came from the Veritas site. Try /alpha for live signals, then /score for the on-chain track record.\n\n"
      : "";
  return ctx.reply(
    greet +
      "🛰️ *Veritas* — verifiable smart-money intel for Mantle.\n\n" +
      "/alpha — live signals\n/score — verified accuracy\n/index — Smart Money Index\n/track <wallet> — follow a wallet",
    { parse_mode: "Markdown" }
  );
});

bot.command("alpha", async (ctx) => {
  // Show latest signals regardless of outcome — status badges prove the
  // verifiable track record inline (pending / won / lost), and /alpha is
  // never empty for a judge.
  const rows = await sql`
    SELECT type, payload->>'asset' AS asset, thesis, confidence, direction,
           outcome, commit_tx
    FROM signals
    ORDER BY created_at DESC
    LIMIT 5
  `;
  if (!rows.length) return ctx.reply("No live signals yet. Indexer warming up.");
  const badge = (o: string) =>
    o === "won" ? "✅ WON" : o === "lost" ? "❌ LOST" : "⏳ LIVE";
  const msg = rows
    .map((r: any) => {
      const arrow = r.direction === "short" ? "🔻 SHORT" : "🔺 LONG";
      const asset = r.asset ?? "";
      return (
        `*${r.type}* · ${asset} · ${arrow} · ${r.confidence}% · ${badge(r.outcome)}\n${r.thesis ?? "—"}\n${
          r.commit_tx
            ? `🔗 Verify on-chain: https://explorer.sepolia.mantle.xyz/tx/${r.commit_tx}`
            : "⏳ committing"
        }`
      );
    })
    .join("\n\n");
  return ctx.reply(msg, { parse_mode: "Markdown" });
});

bot.command("score", async (ctx) => {
  const rows = await sql`
    SELECT
      COUNT(*) FILTER (WHERE outcome = 'won')  AS wins,
      COUNT(*) FILTER (WHERE outcome IN ('won','lost')) AS total
    FROM signals
  `;
  const { wins, total } = rows[0] as any;
  const acc = total > 0 ? ((wins / total) * 100).toFixed(1) : "—";
  return ctx.reply(
    `📊 Verified accuracy: *${acc}%*\n${wins}/${total} resolved signals (on-chain)`,
    { parse_mode: "Markdown" }
  );
});

bot.command("index", async (ctx) => {
  return ctx.reply("📈 Smart Money Index — on-chain publish coming after deploy.");
});

bot.command("track", (ctx) =>
  ctx.reply("Wallet tracking — wiring in next build step.")
);

bot.catch((err) => console.error("bot error:", err));

console.log("🤖 Veritas bot running");
bot.start();
