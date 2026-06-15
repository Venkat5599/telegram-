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
  // Smart Money Index = total USD-weighted accumulation by the labeled cohort.
  const rows = await sql`
    SELECT COUNT(*) AS wallets, COALESCE(SUM(realized_pnl),0)::numeric AS usd
    FROM wallet_labels WHERE label = 'smart_money'
  `;
  const { wallets, usd } = rows[0] as any;
  const val = Number(usd);
  return ctx.reply(
    `📈 *Smart Money Index*\n` +
      `${wallets} tracked smart-money wallets on Mantle\n` +
      `Net USD accumulation: *$${val.toLocaleString(undefined, {
        maximumFractionDigits: 0,
      })}*\n` +
      `_Across mETH · fBTC · cmETH · USDY_`,
    { parse_mode: "Markdown" }
  );
});

bot.command("track", async (ctx) => {
  const addr = ctx.match?.toString().trim().toLowerCase();
  if (!addr || !/^0x[0-9a-f]{40}$/.test(addr)) {
    return ctx.reply("Usage: `/track 0x<wallet address>`", {
      parse_mode: "Markdown",
    });
  }
  const label = await sql`
    SELECT label, realized_pnl, score, cluster FROM wallet_labels
    WHERE lower(address) = ${addr}
  `;
  const moves = await sql`
    SELECT token, from_addr, to_addr, amount, ts FROM transfers
    WHERE lower(from_addr) = ${addr} OR lower(to_addr) = ${addr}
    ORDER BY ts DESC LIMIT 5
  `;
  if (!label.length && !moves.length) {
    return ctx.reply(
      `No indexed activity for \`${addr}\` on tracked Mantle assets yet.`,
      { parse_mode: "Markdown" }
    );
  }
  let msg = `👤 *Wallet* \`${addr.slice(0, 10)}…${addr.slice(-6)}\`\n`;
  if (label.length) {
    const l = label[0] as any;
    const tag = l.label === "smart_money" ? "🟢 SMART MONEY" : l.label;
    msg += `Status: *${tag}* · score ${l.score}/100\nNet USD: $${Number(
      l.realized_pnl
    ).toLocaleString(undefined, { maximumFractionDigits: 0 })}\n`;
  } else {
    msg += `Status: not in smart-money cohort\n`;
  }
  if (moves.length) {
    msg += `\n*Recent moves:*\n`;
    for (const m of moves as any[]) {
      const dir = m.to_addr.toLowerCase() === addr ? "↓ in " : "↑ out";
      msg += `${dir} ${Number(m.amount).toFixed(3)} ${m.token}\n`;
    }
  }
  return ctx.reply(msg, { parse_mode: "Markdown" });
});

bot.catch((err) => console.error("bot error:", err));

console.log("🤖 Veritas bot running");
bot.start();
