// Single source for the Telegram deep link + API base.
export const TELEGRAM_BOT = "Subheeksh_bot";
export const TELEGRAM_DEEPLINK = `https://t.me/${TELEGRAM_BOT}?start=judge`;

// Veritas B2B/read API. Defaults to localhost in dev; set NEXT_PUBLIC_API_BASE in prod.
export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:3001";
