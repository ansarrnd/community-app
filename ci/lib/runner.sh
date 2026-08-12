#!/usr/bin/env bash
# CI pipeline orchestrator — runs lifecycle stages in order.
set -euo pipefail

source "$(dirname "${BASH_SOURCE[0]}")/common.sh"

LIFECYCLE_STAGES=(
  validate
  security
  quality
  test
  build
  e2e
  deploy
)

usage() {
  cat <<EOF
Usage: ci/run.sh [OPTIONS] [STAGE...]

Portable CI/CD runner for mobile & cross-platform projects.
Supports: Kotlin/Java, Swift, Obj-C, React Native, Flutter, KMP, CMP.

Options:
  --mode MODE       Execution mode: local | cloud | hybrid (default: from config)
  --stack STACK     Override stack: react-native | flutter | kmp | cmp | kotlin-java | swift | objc
  --config PATH     Path to project.yml
  --list            List available stages
  --dry-run         Show what would run without executing
  -h, --help        Show this help

Stages (full lifecycle):
  validate   Pre-commit checks (format, commit message)
  security   Secret scan, SAST, dependency audit
  quality    Lint, type-check, coverage gates
  test       Unit & integration tests (all platforms)
  build      Compile native artifacts
  e2e        End-to-end tests (typically local/self-hosted)
  deploy     Staging / production deployment

Examples:
  ./ci/run.sh                          # Run default stages from config
  ./ci/run.sh security quality test    # Run specific stages
  ./ci/run.sh --mode local test build  # Local-only execution
  CI_EXECUTION_MODE=cloud ./ci/run.sh  # Force cloud stages only

Environment:
  CI_EXECUTION_MODE   local | cloud | hybrid
  CI_STACK            Stack override
  CI_CONFIG           Config file path
  CI_SELF_HOSTED      true when on self-hosted runner
EOF
}

list_stages() {
  echo "Lifecycle stages:"
  for s in "${LIFECYCLE_STAGES[@]}"; do
    local script="$CI_STAGES/${s}.sh"
    if [[ -f "$script" ]]; then
      echo "  ✓ $s"
    else
      echo "  ✗ $s (not implemented)"
    fi
  done
  echo ""
  echo "Configured stack: $(ci_stack)"
  echo "Execution mode:   $(ci_execution_mode)"
  echo "OS:               $(ci_os)"
  echo "Project root:     $PROJECT_ROOT"
}

get_default_stages() {
  local stages
  stages=$(ci_config_list "stages")
  if [[ -n "$stages" ]]; then
    echo "$stages"
  else
    echo "security quality test"
  fi
}

run_stage() {
  local stage="$1"
  local script="$CI_STAGES/${stage}.sh"

  if [[ ! -f "$script" ]]; then
    ci_warn "Stage '$stage' has no implementation — skipping"
    return 0
  fi

  ci_stage "$stage"
  ci_timer_start
  # shellcheck source=/dev/null
  source "$script"
  stage_${stage} || ci_fail "Stage '$stage' failed"
  ci_timer_end
}

main() {
  local dry_run=false
  local stages=()

  while [[ $# -gt 0 ]]; do
    case "$1" in
      --mode)    export CI_EXECUTION_MODE="$2"; shift 2 ;;
      --stack)   export CI_STACK="$2"; shift 2 ;;
      --config)  export CI_CONFIG="$2"; shift 2 ;;
      --list)    list_stages; exit 0 ;;
      --dry-run) dry_run=true; shift ;;
      -h|--help) usage; exit 0 ;;
      --)        shift; break ;;
      -*)        ci_fail "Unknown option: $1" ;;
      *)         stages+=("$1"); shift ;;
    esac
  done

  if [[ $# -gt 0 ]]; then
    stages+=("$@")
  fi

  cd "$PROJECT_ROOT"
  ci_load_stack_defaults

  if [[ ${#stages[@]} -eq 0 ]]; then
    while IFS= read -r line; do
      [[ -n "$line" ]] && stages+=("$line")
    done < <(get_default_stages)
  fi

  ci_log "Pipeline: ${stages[*]}"
  ci_log "Mode: $(ci_execution_mode) | Stack: $(ci_stack) | OS: $(ci_os)"

  if $dry_run; then
    for s in "${stages[@]}"; do
      echo "  [dry-run] would run: $s"
    done
    exit 0
  fi

  local failed=0
  for stage in "${stages[@]}"; do
    if ! run_stage "$stage"; then
      failed=1
      break
    fi
  done

  if [[ $failed -eq 1 ]]; then
    ci_fail "Pipeline failed at stage: ${stage:-unknown}"
  fi

  ci_ok "Pipeline completed successfully"
}

main "$@"
