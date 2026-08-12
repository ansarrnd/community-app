#!/usr/bin/env bash
#
# Golden local CI/CD — mirrors .github/workflows/ci.yml
# Run on Linux or macOS anytime before push/PR.
#
# Usage:
#   ./scripts/ci-local.sh              # full pipeline (same as GitHub CI)
#   ./scripts/ci-local.sh --fast       # quality only (type-check · jest · perf)
#   ./scripts/ci-local.sh --skip-screenshots
#   ./scripts/ci-local.sh --skip-e2e
#   ./scripts/ci-local.sh --no-install   # skip npm ci (already installed)
#   ./scripts/ci-local.sh --with-native  # macOS only: Maestro native screenshots
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

NODE_MAJOR="${CI_NODE_MAJOR:-22}"
REPORT_DIR="${CI_REPORT_DIR:-$ROOT/.ci-reports}"
REPORT_FILE="$REPORT_DIR/ci-local-$(date +%Y%m%d-%H%M%S).log"
START_TS="$(date +%s)"

FAST=false
SKIP_E2E=false
SKIP_SCREENSHOTS=false
SKIP_INSTALL=false
WITH_NATIVE=false

for arg in "$@"; do
  case "$arg" in
    --fast) FAST=true ;;
    --skip-e2e) SKIP_E2E=true ;;
    --skip-screenshots) SKIP_SCREENSHOTS=true ;;
    --no-install) SKIP_INSTALL=true ;;
    --with-native) WITH_NATIVE=true ;;
    -h|--help)
      sed -n '2,12p' "$0" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    *)
      echo "Unknown option: $arg (try --help)" >&2
      exit 2
      ;;
  esac
done

mkdir -p "$REPORT_DIR"

# ── helpers ──────────────────────────────────────────────────────────────────

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

STAGE_RESULTS=()
FAILED=0

log() {
  local line="[$(date '+%H:%M:%S')] $*"
  echo -e "$line" | tee -a "$REPORT_FILE"
}

banner() {
  echo "" | tee -a "$REPORT_FILE"
  echo -e "${BOLD}${CYAN}════════════════════════════════════════════════════════════${RESET}" | tee -a "$REPORT_FILE"
  echo -e "${BOLD}${CYAN}  $*${RESET}" | tee -a "$REPORT_FILE"
  echo -e "${BOLD}${CYAN}════════════════════════════════════════════════════════════${RESET}" | tee -a "$REPORT_FILE"
}

run_stage() {
  local name="$1"
  shift
  local stage_start
  stage_start="$(date +%s)"
  banner "STAGE: $name"

  if "$@"; then
    local elapsed=$(( $(date +%s) - stage_start ))
    log "${GREEN}✓ PASS${RESET} $name (${elapsed}s)"
    STAGE_RESULTS+=("PASS  $name (${elapsed}s)")
  else
    local elapsed=$(( $(date +%s) - stage_start ))
    log "${RED}✗ FAIL${RESET} $name (${elapsed}s)"
    STAGE_RESULTS+=("FAIL  $name (${elapsed}s)")
    FAILED=1
    if [[ "${CI_LOCAL_NO_FAIL_FAST:-}" != "1" ]]; then
      return 1
    fi
  fi
}

check_node() {
  if ! command -v node >/dev/null 2>&1; then
    echo "Node.js is not installed. Install Node ${NODE_MAJOR}." >&2
    exit 1
  fi
  local ver major
  ver="$(node -p 'process.versions.node')"
  major="${ver%%.*}"
  if [[ "$major" -lt "$NODE_MAJOR" ]]; then
    echo "Node $ver detected; require >= ${NODE_MAJOR}.x (use nvm/fnm/asdf)." >&2
    exit 1
  fi
  log "Node $ver · platform $(uname -s)/$(uname -m)"
}

install_deps() {
  if [[ "$SKIP_INSTALL" == true ]]; then
    log "Skipping npm ci (--no-install)"
    return 0
  fi
  if [[ -f package-lock.json ]]; then
    npm ci
  else
    log "${YELLOW}No package-lock.json — falling back to npm install${RESET}"
    npm install
  fi
}

install_playwright() {
  if [[ "$(uname -s)" == "Linux" ]]; then
    npx playwright install chromium --with-deps
  else
    npx playwright install chromium
  fi
}

stage_quality() {
  npm run type-check
  npm test
  npm run test:perf
}

stage_build_web() {
  npm run build:web
}

stage_web_e2e() {
  npm run bundle:check
  npm run test:e2e
}

stage_screenshots() {
  npm run screenshots:candidate
  npm run screenshots:compare
}

stage_native_maestro() {
  if [[ "$(uname -s)" != "Darwin" ]]; then
    log "${YELLOW}Maestro native flows require macOS — skipped on $(uname -s)${RESET}"
    return 0
  fi
  if ! command -v maestro >/dev/null 2>&1; then
    log "${YELLOW}Maestro CLI not found — install: https://maestro.mobile.dev${RESET}"
    return 1
  fi
  npm run screenshots:native:ios
  npm run screenshots:native:android
}

print_summary() {
  local total_elapsed=$(( $(date +%s) - START_TS ))
  echo "" | tee -a "$REPORT_FILE"
  echo -e "${BOLD}──────────────── CI LOCAL SUMMARY ────────────────${RESET}" | tee -a "$REPORT_FILE"
  for row in "${STAGE_RESULTS[@]}"; do
    if [[ "$row" == FAIL* ]]; then
      echo -e "  ${RED}$row${RESET}" | tee -a "$REPORT_FILE"
    else
      echo -e "  ${GREEN}$row${RESET}" | tee -a "$REPORT_FILE"
    fi
  done
  echo -e "${BOLD}─────────────────────────────────────────────────${RESET}" | tee -a "$REPORT_FILE"
  log "Total time: ${total_elapsed}s"
  log "Report: $REPORT_FILE"
  if [[ "$FAILED" -eq 0 ]]; then
    echo -e "${GREEN}${BOLD}CI LOCAL: ALL STAGES PASSED${RESET}" | tee -a "$REPORT_FILE"
  else
    echo -e "${RED}${BOLD}CI LOCAL: FAILED — fix errors above before merge${RESET}" | tee -a "$REPORT_FILE"
  fi
}

# ── pipeline ─────────────────────────────────────────────────────────────────

banner "Community Connect — Local Golden CI"
log "Repo: $ROOT"
log "Mode: $([ "$FAST" == true ] && echo 'fast (quality only)' || echo 'full (mirrors ci.yml)')"

check_node
run_stage "install · npm ci" install_deps

if [[ "$FAST" == true ]]; then
  run_stage "quality · type-check · jest · perf" stage_quality || true
  print_summary
  exit "$FAILED"
fi

run_stage "quality · type-check · jest · perf" stage_quality || true

if [[ "$FAILED" -eq 0 ]]; then
  NEED_PLAYWRIGHT=false
  if [[ "$SKIP_E2E" == false || "$SKIP_SCREENSHOTS" == false ]]; then
    NEED_PLAYWRIGHT=true
  fi
  if [[ "$WITH_NATIVE" == true ]]; then
    NEED_PLAYWRIGHT=true
  fi

  if [[ "$NEED_PLAYWRIGHT" == true ]]; then
    run_stage "playwright · install chromium" install_playwright || true
  fi

  if [[ "$FAILED" -eq 0 ]]; then
    run_stage "web · expo export + patch" stage_build_web || true
  fi

  if [[ "$FAILED" -eq 0 ]]; then
  # Parallel downstream jobs (same topology as GitHub Actions after quality)
    E2E_PID=""
    SS_PID=""

    if [[ "$SKIP_E2E" == false ]]; then
      (
        set -euo pipefail
        stage_web_e2e
      ) &
      E2E_PID=$!
    fi

    if [[ "$SKIP_SCREENSHOTS" == false ]]; then
      (
        set -euo pipefail
        stage_screenshots
      ) &
      SS_PID=$!
    fi

    if [[ -n "$E2E_PID" ]]; then
      if wait "$E2E_PID"; then
        STAGE_RESULTS+=("PASS  web-e2e · bundle · playwright (parallel)")
        log "${GREEN}✓ PASS${RESET} web-e2e · bundle · playwright"
      else
        STAGE_RESULTS+=("FAIL  web-e2e · bundle · playwright (parallel)")
        log "${RED}✗ FAIL${RESET} web-e2e · bundle · playwright"
        FAILED=1
      fi
    fi

    if [[ -n "$SS_PID" ]]; then
      if wait "$SS_PID"; then
        STAGE_RESULTS+=("PASS  screenshots · pixelmatch (parallel)")
        log "${GREEN}✓ PASS${RESET} screenshots · pixelmatch"
      else
        STAGE_RESULTS+=("FAIL  screenshots · pixelmatch (parallel)")
        log "${RED}✗ FAIL${RESET} screenshots · pixelmatch"
        FAILED=1
      fi
    fi
  fi

  if [[ "$WITH_NATIVE" == true && "$FAILED" -eq 0 ]]; then
    run_stage "native · Maestro iOS/Android (optional)" stage_native_maestro || true
  fi
fi

print_summary
exit "$FAILED"
