// pm2 process map for the VPS. Run: pm2 start ecosystem.config.cjs
// Use `bun run <file>` via interpreter:none so pm2 doesn't require() modules
// that use top-level await (indexer/orchestrator) — which bun's fork wrapper
// cannot load.
const opts = (name, file) => ({
  name,
  script: "bun",
  args: `run ${file}`,
  interpreter: "none",
  cwd: __dirname,
  autorestart: true,
  max_restarts: 20,
});

module.exports = {
  apps: [
    opts("veritas-indexer", "indexer/index.ts"),
    opts("veritas-brain", "engine/orchestrator.ts"),
    opts("veritas-api", "api/index.ts"),
    opts("veritas-bot", "bot/index.ts"),
    {
      name: "veritas-web",
      script: "bun",
      args: "run start",
      interpreter: "none",
      cwd: __dirname + "/web",
      env: { PORT: "3000", HOSTNAME: "0.0.0.0" },
      autorestart: true,
      max_restarts: 20,
    },
  ],
};
