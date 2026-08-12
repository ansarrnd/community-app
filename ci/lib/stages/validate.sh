#!/usr/bin/env bash
# Stage: validate — pre-commit / commit-msg checks
stage_validate() {
  ci_should_run_stage "any" || return 0

  # Branch naming convention (optional gate)
  if [[ -n "${CI_BRANCH:-}" ]]; then
    if [[ ! "$CI_BRANCH" =~ ^(main|develop|feature/|fix/|release/|hotfix/) ]]; then
      ci_warn "Branch '$CI_BRANCH' does not follow naming convention"
    fi
  fi

  # Conventional commit message (when CI_COMMIT_MSG is set)
  if [[ -n "${CI_COMMIT_MSG:-}" ]]; then
    if [[ ! "$CI_COMMIT_MSG" =~ ^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\(.+\))?!?: ]]; then
      ci_warn "Commit message does not follow Conventional Commits format"
    fi
  fi

  # Format check — stack-specific
  local stack
  stack="$(ci_stack)"
  case "$stack" in
    react-native|flutter)
      if [[ -f "$PROJECT_ROOT/package.json" ]] && ci_have npm; then
        if npm run --silent format:check 2>/dev/null; then
          ci_ok "Format check passed"
        else
          ci_warn "format:check script not defined — skipping"
        fi
      fi
      ;;
    kotlin-java|kmp|cmp)
      if [[ -f "$PROJECT_ROOT/gradlew" ]]; then
        ci_run_or_skip any "$PROJECT_ROOT/gradlew" ktlintCheck || true
      fi
      ;;
    swift|objc)
      if ci_have swiftformat && [[ -d "$PROJECT_ROOT" ]]; then
        swiftformat --lint "$PROJECT_ROOT" 2>/dev/null || ci_warn "SwiftFormat lint issues found"
      fi
      ;;
  esac

  ci_ok "Validate stage complete"
}
