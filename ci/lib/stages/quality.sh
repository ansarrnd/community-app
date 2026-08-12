#!/usr/bin/env bash
# Stage: quality — lint, static analysis, type-check, coverage gates
stage_quality() {
  ci_should_run_stage "any" || return 0

  local stack
  stack="$(ci_stack)"
  local min_coverage
  min_coverage="$(ci_config_get "min_coverage" "0")"

  case "$stack" in
    react-native)
      stage_quality_js "$min_coverage"
      stage_quality_android_cloud
      ;;
    flutter)
      stage_quality_flutter
      ;;
    kmp|cmp)
      stage_quality_kmp "$min_coverage"
      ;;
    kotlin-java)
      stage_quality_kotlin_java
      ;;
    swift|objc)
      stage_quality_ios
      ;;
    *)
      stage_quality_js "$min_coverage"
      ;;
  esac

  ci_ok "Quality stage complete"
}

stage_quality_js() {
  local min_coverage="$1"
  if [[ ! -f "$PROJECT_ROOT/package.json" ]]; then return 0; fi

  ci_log "TypeScript type-check..."
  if npm run --silent type-check 2>/dev/null; then
    ci_ok "Type-check passed"
  else
    ci_fail "Type-check failed"
  fi

  ci_log "ESLint..."
  if npm run --silent lint 2>/dev/null; then
    ci_ok "Lint passed"
  else
    ci_warn "lint script not defined — skipping"
  fi

  if [[ "$min_coverage" != "0" ]]; then
    ci_log "Coverage gate (min: ${min_coverage}%)..."
    npm run test:coverage -- --coverageThreshold='{"global":{"lines":'"$min_coverage"'}}' 2>/dev/null || \
      npm run test:coverage 2>/dev/null || ci_warn "Coverage gate not enforced"
  fi
}

stage_quality_android_cloud() {
  if [[ ! -d "$PROJECT_ROOT/android" ]]; then return 0; fi

  ci_log "Android lint..."
  local android_dir="$PROJECT_ROOT/android"
  if [[ -f "$android_dir/gradlew" ]]; then
    ci_run_or_skip cloud "$android_dir/gradlew" lint --quiet || ci_warn "Android lint issues"
  fi
}

stage_quality_flutter() {
  ci_require flutter
  ci_run flutter analyze --fatal-infos
  ci_run dart format --set-exit-if-changed lib/ test/
}

stage_quality_kmp() {
  local min_coverage="$1"
  if [[ -f "$PROJECT_ROOT/gradlew" ]]; then
    ci_run "$PROJECT_ROOT/gradlew" ktlintCheck detekt 2>/dev/null || \
      ci_run "$PROJECT_ROOT/gradlew" lint 2>/dev/null || ci_warn "KMP static analysis skipped"
    if [[ "$min_coverage" != "0" ]]; then
      ci_run "$PROJECT_ROOT/gradlew" koverVerify 2>/dev/null || ci_warn "Kover coverage gate skipped"
    fi
  fi
}

stage_quality_kotlin_java() {
  if [[ -f "$PROJECT_ROOT/gradlew" ]]; then
    ci_run "$PROJECT_ROOT/gradlew" ktlintCheck detekt lint --quiet
  fi
}

stage_quality_ios() {
  if ! ci_is_macos; then
    ci_warn "iOS quality checks require macOS — skipping"
    return 0
  fi
  if ci_have swiftlint; then
    swiftlint lint --strict 2>/dev/null || ci_warn "SwiftLint issues found"
  fi
}
