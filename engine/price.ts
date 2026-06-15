// USD price source for Mantle RWA/LST assets. Used to (a) USD-weight wallet
// labeling so cross-asset flows are comparable, and (b) resolve signals against
// a real price move (entry vs exit) instead of a flow heuristic.

const COINGECKO_ID: Record<string, string> = {
  mETH: "mantle-staked-ether",
  fBTC: "ignition-fbtc",
  cmETH: "mantle-staked-ether", // proxy until cmETH has its own feed
  USDY: "ondo-us-dollar-yield",
};

let cache: { at: number; prices: Record<string, number> } = { at: 0, prices: {} };

export async function getPrices(): Promise<Record<string, number>> {
  if (Date.now() - cache.at < 60_000 && Object.keys(cache.prices).length) {
    return cache.prices;
  }
  const ids = [...new Set(Object.values(COINGECKO_ID))].join(",");
  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`,
      { signal: AbortSignal.timeout(10_000) }
    );
    const data = (await res.json()) as Record<string, { usd: number }>;
    const prices: Record<string, number> = {};
    for (const [asset, id] of Object.entries(COINGECKO_ID)) {
      if (data[id]?.usd) prices[asset] = data[id].usd;
    }
    cache = { at: Date.now(), prices };
    return prices;
  } catch {
    return cache.prices; // last known
  }
}

export async function priceOf(asset: string): Promise<number | null> {
  const p = await getPrices();
  return p[asset] ?? null;
}
