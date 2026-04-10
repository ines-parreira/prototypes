#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(dirname "$SCRIPT_DIR")"
PROXY_SCRIPT="$SCRIPT_DIR/helpdesk_dev_proxy.py"
export PROXY_PORT="${PROXY_PORT:-8002}"
export DEV_PORT="${DEV_PORT:-8080}"

cleanup() {
    if [[ -n "${PROXY_PID:-}" ]]; then
        echo "Stopping mitmproxy (PID $PROXY_PID)..."
        kill "$PROXY_PID" 2>/dev/null || true
    fi
}
trap cleanup EXIT

check_port() {
    local port=$1
    local name=$2
    if lsof -i :"$port" -sTCP:LISTEN >/dev/null 2>&1; then
        echo "Error: Port $port is already in use ($name)."
        echo "Run 'lsof -i :$port' to see which process is using it."
        exit 1
    fi
}

cd "$REPO_DIR"

if ! grep -q "acme.gorgias.docker" /etc/hosts; then
    echo "Error: 'acme.gorgias.docker' not found in /etc/hosts."
    echo "Add the following line to /etc/hosts:"
    echo "  127.0.0.1 acme.gorgias.docker"
    exit 1
fi

STASHED=false
if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "==> Stashing local changes..."
    git stash save "dev-proxy-setup auto-stash"
    STASHED=true
fi

CURRENT_BRANCH="$(git branch --show-current)"
if [ "$CURRENT_BRANCH" = "main" ]; then
    echo "==> Pulling latest main..."
    git pull origin main
else
    echo "==> Fetching and rebasing onto origin/main (current branch: $CURRENT_BRANCH)..."
    git fetch origin main
    git rebase origin/main
fi

if [ "$STASHED" = true ]; then
    echo "==> Restoring stashed changes..."
    git stash pop
fi

echo "==> Installing dependencies..."
pnpm install

check_port $PROXY_PORT "mitmproxy"
check_port $DEV_PORT "dev server"

echo "==> Starting mitmproxy on port $PROXY_PORT..."
mitmdump --no-http2 --set validate_inbound_headers=false --listen-port $PROXY_PORT -s "$PROXY_SCRIPT" &
PROXY_PID=$!
sleep 2

if ! kill -0 "$PROXY_PID" 2>/dev/null; then
    echo "Error: mitmproxy failed to start."
    exit 1
fi

echo "==> Starting dev server on port $DEV_PORT..."
echo "    App will be available at https://acme.gorgias.docker:$DEV_PORT/"
pnpm dev:proxy
