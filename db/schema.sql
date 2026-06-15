-- Veritas proprietary store. This dataset IS the moat (Data source quality 15pts).

CREATE TABLE IF NOT EXISTS indexer_state (
  adapter      TEXT PRIMARY KEY,
  last_block   BIGINT NOT NULL DEFAULT 0,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transfers (
  id          BIGSERIAL PRIMARY KEY,
  token       TEXT NOT NULL,
  from_addr   TEXT NOT NULL,
  to_addr     TEXT NOT NULL,
  amount      NUMERIC NOT NULL,
  block       BIGINT NOT NULL,
  tx_hash     TEXT NOT NULL,
  ts          TIMESTAMPTZ NOT NULL,
  UNIQUE (tx_hash, token, from_addr, to_addr, amount)
);
CREATE INDEX IF NOT EXISTS idx_transfers_token ON transfers(token);
CREATE INDEX IF NOT EXISTS idx_transfers_to ON transfers(to_addr);

CREATE TABLE IF NOT EXISTS pool_events (
  id          BIGSERIAL PRIMARY KEY,
  protocol    TEXT NOT NULL,
  pool        TEXT NOT NULL,
  kind        TEXT NOT NULL,          -- swap | mint | burn
  trader      TEXT,
  amount0     NUMERIC,
  amount1     NUMERIC,
  block       BIGINT NOT NULL,
  tx_hash     TEXT NOT NULL,
  ts          TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_pool_events_protocol ON pool_events(protocol);

-- RWA / LST flow intelligence — Mantle-native, nobody else indexes this deeply.
CREATE TABLE IF NOT EXISTS rwa_flows (
  id          BIGSERIAL PRIMARY KEY,
  asset       TEXT NOT NULL,          -- mETH | fBTC | MI4 | USDY
  kind        TEXT NOT NULL,          -- mint | redeem | rebalance
  actor       TEXT,
  amount      NUMERIC NOT NULL,
  block       BIGINT NOT NULL,
  tx_hash     TEXT NOT NULL,
  ts          TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_rwa_asset ON rwa_flows(asset);

CREATE TABLE IF NOT EXISTS bridge_inflows (
  id          BIGSERIAL PRIMARY KEY,
  actor       TEXT NOT NULL,
  token       TEXT NOT NULL,
  amount      NUMERIC NOT NULL,
  first_touch TEXT,                   -- first protocol/contract interacted
  block       BIGINT NOT NULL,
  tx_hash     TEXT NOT NULL,
  ts          TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS wallet_labels (
  address      TEXT PRIMARY KEY,
  label        TEXT,                  -- smart_money | mercenary | retail | lp
  realized_pnl NUMERIC DEFAULT 0,
  score        NUMERIC DEFAULT 0,
  cluster      TEXT,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_labels_label ON wallet_labels(label);

CREATE TABLE IF NOT EXISTS signals (
  id           BIGSERIAL PRIMARY KEY,
  type         TEXT NOT NULL,         -- rwa_flow | rotation | anomaly
  payload      JSONB NOT NULL,        -- raw evidence
  thesis       TEXT,                  -- LLM plain-English
  confidence   SMALLINT NOT NULL,     -- 0-100
  commit_tx    TEXT,                  -- on-chain commit hash
  onchain_id   BIGINT,                -- id assigned by SmartMoneyIndex contract
  signal_hash  TEXT,                  -- bytes32 committed
  outcome      TEXT,                  -- pending | won | lost
  resolve_tx   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at  TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_signals_outcome ON signals(outcome);
