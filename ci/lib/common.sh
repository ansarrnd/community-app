#!/usr/bin/env bash
# Shared utilities for portable CI/CD (Linux + macOS).
set -euo pipefail

# ── Colors & logging ──────────────────────────────────────────────────────────
if [[ -t 1 ]]; then
  RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
  BLUE='\033[0;34m'; CYAN='\033[0;36m'; NC='\033[0m'
else
  RED=''; GREEN=''; YELLOW=''; BLUE=''; CYAN=''; NC=''
fi

ci_log()   { echo -e "${BLUE}[ci]${NC} $*"; }
ci_ok()    { echo -e "${GREEN}[ok]${NC} $*"; }
ci_warn()  { echo -e "${YELLOW}[warn]${NC} $*" >&2; }
ci_fail()  { echo -e "${RED}[fail]${NC} $*" >&2; exit 1; }
ci_stage() { echo -e "\n${CYAN}━━━ $* ━━━${NC}"; }

# ── Paths ─────────────────────────────────────────────────────────────────────
CI_ROOT="${CI_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
PROJECT_ROOT="${PROJECT_ROOT:-$(cd "$CI_ROOT/.." && pwd)}"
CI_CONFIG="${CI_CONFIG:-$CI_ROOT/config/project.yml}"
CI_LIB="$CI_ROOT/lib"
CI_STAGES="$CI_LIB/stages"
CI_CACHE_DIR="${CI_CACHE_DIR:-$PROJECT_ROOT/.ci-cache}"

export CI_ROOT PROJECT_ROOT CI_CONFIG CI_LIB CI_STAGES CI_CACHE_DIR

# ── OS / environment detection ────────────────────────────────────────────────
ci_os() {
  case "$(uname -s)" in
    Darwin) echo "macos" ;;
    Linux)  echo "linux" ;;
    *)      echo "unknown" ;;
  esac
}

ci_is_macos() { [[ "$(ci_os)" == "macos" ]]; }
ci_is_linux() { [[ "$(ci_os)" == "linux" ]]; }

ci_is_github_actions() { [[ "${GITHUB_ACTIONS:-}" == "true" ]]; }
ci_is_self_hosted()    { [[ "${CI_SELF_HOSTED:-}" == "true" ]] || \
  [[ "${RUNNER_ENVIRONMENT:-}" == "self-hosted" ]]; }

# Execution mode: local | cloud | hybrid (default from config or env)
ci_execution_mode() {
  if [[ -n "${CI_EXECUTION_MODE:-}" ]]; then
    echo "$CI_EXECUTION_MODE"
  else
    ci_config_get "execution_mode" "hybrid"
  fi
}

# Should this stage run in current environment?
# cloud stages skip on local-only runs without GITHUB_ACTIONS
# local stages skip on ubuntu cloud runners
ci_should_run_stage() {
  local stage_env="$1"  # cloud | local | any
  local mode
  mode="$(ci_execution_mode)"

  case "$mode" in
    local)
      [[ "$stage_env" != "cloud" ]] || return 1
      ;;
    cloud)
      [[ "$stage_env" != "local" ]] || return 1
      ;;
    hybrid)
      if [[ "$stage_env" == "local" ]]; then
        ci_is_macos || ci_is_self_hosted || return 1
      fi
      if [[ "$stage_env" == "cloud" ]]; then
        ci_is_linux || ci_is_github_actions || return 1
      fi
      ;;
  esac
  return 0
}

# ── Minimal YAML reader (no yq dependency for basic keys) ─────────────────────
ci_config_get() {
  local key="$1"
  local default="${2:-}"
  local file="${CI_CONFIG}"

  if [[ ! -f "$file" ]]; then
    echo "$default"
    return
  fi

  # Match top-level key: value (simple scalar)
  local val
  val=$(grep -E "^${key}:" "$file" 2>/dev/null | head -1 | sed 's/^[^:]*:[[:space:]]*//' | tr -d '"' | tr -d "'")
  if [[ -n "$val" ]]; then
    echo "$val"
  else
    echo "$default"
  fi
}

ci_config_list() {
  local section="$1"
  local file="${CI_CONFIG}"
  awk "/^${section}:/{found=1; next} found && /^[a-z]/{exit} found && /^  - /{print \$2}" "$file" 2>/dev/null | tr -d '"' | tr -d "'"
}

ci_stack() {
  if [[ -n "${CI_STACK:-}" ]]; then
    echo "$CI_STACK"
  else
    ci_config_get "stack" "react-native"
  fi
}

# Merge stack defaults into runtime vars
ci_load_stack_defaults() {
  local stack
  stack="$(ci_stack)"
  local stack_file="$CI_ROOT/config/stacks/${stack}.yml"
  if [[ -f "$stack_file" ]]; then
  ci_log "Loading stack defaults: $stack"
    export CI_STACK_FILE="$stack_file"
  fi
}

# ── Tool availability ─────────────────────────────────────────────────────────
ci_have() { command -v "$1" &>/dev/null; }

ci_require() {
  local tool="$1"
  if ! ci_have "$tool"; then
    ci_fail "Required tool not found: $tool. Run: ci/tools/install-deps.sh"
  fi
}

ci_run() {
  ci_log "→ $*"
  "$@"
}

ci_run_or_skip() {
  local reason="$1"
  shift
  if ci_should_run_stage "$reason"; then
  ci_run "$@"
  else
    ci_warn "Skipping (mode=$(ci_execution_mode), env=$reason): $*"
  fi
}

# ── Timing ────────────────────────────────────────────────────────────────────
ci_timer_start() { CI_TIMER_START=$(date +%s); }
ci_timer_end() {
  local end=$(date +%s)
  local elapsed=$((end - CI_TIMER_START))
  ci_ok "Completed in ${elapsed}s"
}

# ── Artifact helpers ──────────────────────────────────────────────────────────
ci_artifact_dir() {
  local dir="${CI_ARTIFACT_DIR:-$CI_CACHE_DIR/artifacts}"
  mkdir -p "$dir"
  echo "$dir"
}

ci_save_artifact() {
  local src="$1"
  local name="$2"
  local dest
  dest="$(ci_artifact_dir)/$name"
  cp -r "$src" "$dest"
  ci_log "Artifact saved: $dest"
}
