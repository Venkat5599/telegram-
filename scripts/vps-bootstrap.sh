#!/usr/bin/env bash
# One-shot VPS bootstrap for Veritas (Ubuntu 24.04).
# Usage: scp this repo to the VPS, then: bash scripts/vps-bootstrap.sh
set -euo pipefail

echo "==> system deps"
apt-get update -y
apt-get install -y curl unzip git postgresql postgresql-contrib

echo "==> bun"
if ! command -v bun >/dev/null 2>&1; then
  curl -fsSL https://bun.sh/install | bash
  export BUN_INSTALL="$HOME/.bun"
  export PATH="$BUN_INSTALL/bin:$PATH"
fi

echo "==> node + pm2 (process manager)"
if ! command -v pm2 >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
  npm i -g pm2
fi

echo "==> postgres db + user"
sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='veritas'" | grep -q 1 || \
  sudo -u postgres psql -c "CREATE USER veritas WITH PASSWORD 'veritas';"
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='veritas'" | grep -q 1 || \
  sudo -u postgres psql -c "CREATE DATABASE veritas OWNER veritas;"

echo "==> app deps + migrate"
export PATH="$HOME/.bun/bin:$PATH"
bun install
bun run db:migrate

echo "==> launch via pm2"
BUN_PATH="$(command -v bun)" pm2 start ecosystem.config.cjs
pm2 save
pm2 startup systemd -u root --hp /root || true

echo "==> done. check: pm2 status"
