// pm2 process map for the VPS. Run: pm2 start ecosystem.config.cjs
const bun = process.env.BUN_PATH || "bun";

module.exports = {
  apps: [
    { name: "veritas-indexer", script: "indexer/index.ts", interpreter: bun },
    { name: "veritas-brain", script: "engine/orchestrator.ts", interpreter: bun },
    { name: "veritas-api", script: "api/index.ts", interpreter: bun },
    { name: "veritas-bot", script: "bot/index.ts", interpreter: bun },
  ],
};
