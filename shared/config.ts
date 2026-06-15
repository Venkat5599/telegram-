import "dotenv/config";

function req(key: string): string {
  const v = process.env[key];
  if (!v) throw new Error(`Missing env: ${key}`);
  return v;
}

export const config = {
  mantleRpc: process.env.MANTLE_RPC ?? "https://rpc.mantle.xyz",
  mantleTestnetRpc:
    process.env.MANTLE_TESTNET_RPC ?? "https://rpc.sepolia.mantle.xyz",
  deployerPk: process.env.DEPLOYER_PK as `0x${string}` | undefined,
  telegramToken: process.env.TELEGRAM_TOKEN,
  deepseekApiKey: process.env.DEEPSEEK_API_KEY,
  llmBaseUrl: process.env.LLM_BASE_URL ?? "https://api.deepseek.com/v1",
  llmModel: process.env.LLM_MODEL ?? "deepseek-chat",
  databaseUrl: req("DATABASE_URL"),
  smartMoneyIndexAddr: process.env.SMART_MONEY_INDEX_ADDR as
    | `0x${string}`
    | undefined,
  erc8004IdentityAddr: process.env.ERC8004_IDENTITY_ADDR as
    | `0x${string}`
    | undefined,
};

// Known Mantle mainnet RWA/LST assets (the moat). Verified on-chain
// (symbol + decimals) 2026-06-15. Add cmETH, MI4, USDY here with verified data.
export const MANTLE_ASSETS = [
  { name: "meth", asset: "mETH", address: "0xcDA86A272531e8640cD7F1a92c01839911B90bb0", decimals: 18 },
  { name: "fbtc", asset: "fBTC", address: "0xC96dE26018A54D51c097160568752c4E3BD6C364", decimals: 8 },
] as const;
