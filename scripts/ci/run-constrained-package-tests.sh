#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(dirname "$(dirname "$SCRIPT_DIR")")"

DEFAULT_NODE_VERSION="22.22.0"
DEFAULT_CPUS="2"
DEFAULT_MEMORY="4g"
DEFAULT_PARALLEL="1"
DEFAULT_TARGET="test:ci:cover"
DEFAULT_REPEAT="1"

NODE_VERSION="$DEFAULT_NODE_VERSION"
CPUS="$DEFAULT_CPUS"
MEMORY="$DEFAULT_MEMORY"
PARALLEL="$DEFAULT_PARALLEL"
TARGET="$DEFAULT_TARGET"
REPEAT="$DEFAULT_REPEAT"
CLEAN_CACHE=false
PACKAGES=()
EXTRA_ARGS=()

usage() {
    cat <<'EOF'
Run package test targets inside a constrained Docker container.

Usage:
  scripts/ci/run-constrained-package-tests.sh [options] <@repo/package> [<@repo/package> ...] [-- <target args>]

Examples:
  scripts/ci/run-constrained-package-tests.sh @repo/tickets
  scripts/ci/run-constrained-package-tests.sh --target test:ci:cover @repo/tickets
  scripts/ci/run-constrained-package-tests.sh --cpus 1 --memory 3g --repeat 10 @repo/tickets
  scripts/ci/run-constrained-package-tests.sh @repo/tickets -- src/ticket-list/components/TicketTable/TicketTable.spec.tsx --maxWorkers=1

Options:
  --cpus <n>          Docker CPU limit. Default: 2
  --memory <size>     Docker memory limit. Default: 4g
  --parallel <n>      Nx run-many parallelism. Default: 1
  --target <target>   Nx target to run. Default: test:ci:cover
                      Use test to trade off some CI fidelity for faster local loops.
  --repeat <n>        Repeat the same run N times. Default: 1
  --node-version <v>  Node version tag for the Docker image. Default: 22.22.0
  --clean-cache       Delete the cached Docker volumes before running
  -h, --help          Show this help message

Everything after `--` is forwarded to the underlying target command.
EOF
}

require_value() {
    local flag=$1
    local value=${2-}

    if [[ -z "$value" ]]; then
        echo "Missing value for $flag" >&2
        exit 1
    fi
}

while (($# > 0)); do
    case "$1" in
        --cpus)
            require_value "$1" "${2-}"
            CPUS="$2"
            shift 2
            ;;
        --memory)
            require_value "$1" "${2-}"
            MEMORY="$2"
            shift 2
            ;;
        --parallel)
            require_value "$1" "${2-}"
            PARALLEL="$2"
            shift 2
            ;;
        --target)
            require_value "$1" "${2-}"
            TARGET="$2"
            shift 2
            ;;
        --repeat)
            require_value "$1" "${2-}"
            REPEAT="$2"
            shift 2
            ;;
        --node-version)
            require_value "$1" "${2-}"
            NODE_VERSION="$2"
            shift 2
            ;;
        --clean-cache)
            CLEAN_CACHE=true
            shift
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        --)
            shift
            EXTRA_ARGS=("$@")
            break
            ;;
        @repo/*)
            PACKAGES+=("$1")
            shift
            ;;
        *)
            echo "Unknown argument: $1" >&2
            usage >&2
            exit 1
            ;;
    esac
done

if [[ ${#PACKAGES[@]} -eq 0 ]]; then
    echo "Provide at least one package name such as @repo/tickets" >&2
    usage >&2
    exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
    echo "Docker is required to run constrained package tests." >&2
    exit 1
fi

if ! [[ "$PARALLEL" =~ ^[1-9][0-9]*$ ]]; then
    echo "--parallel must be a positive integer" >&2
    exit 1
fi

if ! [[ "$REPEAT" =~ ^[1-9][0-9]*$ ]]; then
    echo "--repeat must be a positive integer" >&2
    exit 1
fi

REPO_NAME="$(basename "$REPO_DIR" | tr '[:upper:]' '[:lower:]' | tr -cs 'a-z0-9' '-')"
REPO_HASH="$(printf '%s' "$REPO_DIR" | shasum -a 256 | awk '{print substr($1, 1, 12)}')"
WORKSPACE_VOLUME="${REPO_NAME}constrained-workspace-${REPO_HASH}"
NODE_MODULES_VOLUME="${REPO_NAME}constrained-node-modules-${REPO_HASH}"
PNPM_STORE_VOLUME="${REPO_NAME}constrained-pnpm-store-${REPO_HASH}"
COREPACK_VOLUME="${REPO_NAME}constrained-corepack-${REPO_HASH}"
IMAGE="node:${NODE_VERSION}-bookworm"
PROJECTS="$(IFS=,; echo "${PACKAGES[*]}")"
DOCKER_NPMRC_ARGS=()

if [[ -f "${HOME}/.npmrc" ]]; then
    DOCKER_NPMRC_ARGS=(
        -e NPM_CONFIG_USERCONFIG=/root/.npmrc
        -v "${HOME}/.npmrc:/root/.npmrc:ro"
    )
fi

if [[ "$CLEAN_CACHE" == true ]]; then
    docker volume rm -f \
        "$WORKSPACE_VOLUME" \
        "$NODE_MODULES_VOLUME" \
        "$PNPM_STORE_VOLUME" \
        "$COREPACK_VOLUME" >/dev/null 2>&1 || true
fi

CONTAINER_SCRIPT=$(cat <<'EOF'
set -euo pipefail

mkdir -p /workspace
mkdir -p /pnpm/store

find /workspace -mindepth 1 -maxdepth 1 ! -name node_modules -exec rm -rf {} +

tar \
  --exclude='.git' \
  --exclude='.nx' \
  --exclude='node_modules' \
  --exclude='*/node_modules' \
  --exclude='coverage' \
  --exclude='*/coverage' \
  --exclude='dist' \
  --exclude='*/dist' \
  --exclude='build' \
  --exclude='*/build' \
  -C /src \
  -cf - . | tar -C /workspace -xf -

cd /workspace

corepack enable >/dev/null 2>&1
pnpm config set store-dir /pnpm/store >/dev/null
pnpm install --frozen-lockfile --prefer-offline

echo "==> Constrained package test run"
echo "    target:   $TARGET"
echo "    projects: $PROJECTS"
echo "    parallel: $PARALLEL"
echo "    repeat:   $REPEAT"
echo "    cpus:     $CPUS"
echo "    memory:   $MEMORY"

for run_index in $(seq 1 "$REPEAT"); do
    echo
    echo "==> Iteration ${run_index}/${REPEAT}"
    npx nx run-many \
      --target="$TARGET" \
      --projects="$PROJECTS" \
      --parallel="$PARALLEL" \
      --outputStyle=stream \
      -- "$@"
done
EOF
)

cd "$REPO_DIR"

DOCKER_TTY_ARGS=(--rm -i)

if [[ -t 0 && -t 1 ]]; then
    DOCKER_TTY_ARGS=(--rm -it)
fi

DOCKER_RUN_ARGS=(
    "${DOCKER_TTY_ARGS[@]}"
    --cpus="$CPUS"
    --memory="$MEMORY"
    --memory-swap="$MEMORY"
    -e CI=1
    -e NX_DAEMON=false
    -e NX_SKIP_NX_CACHE=true
    -e COREPACK_HOME=/corepack
    -e TARGET="$TARGET"
    -e PROJECTS="$PROJECTS"
    -e PARALLEL="$PARALLEL"
    -e REPEAT="$REPEAT"
    -e CPUS="$CPUS"
    -e MEMORY="$MEMORY"
    "${DOCKER_NPMRC_ARGS[@]}"
    -v "$REPO_DIR":/src:ro
    -v "$WORKSPACE_VOLUME":/workspace
    -v "$NODE_MODULES_VOLUME":/workspace/node_modules
    -v "$PNPM_STORE_VOLUME":/pnpm/store
    -v "$COREPACK_VOLUME":/corepack
    "$IMAGE"
    bash
    -lc
    "$CONTAINER_SCRIPT"
    --
)

if ((${#EXTRA_ARGS[@]} > 0)); then
    DOCKER_RUN_ARGS+=("${EXTRA_ARGS[@]}")
fi

docker run "${DOCKER_RUN_ARGS[@]}"
