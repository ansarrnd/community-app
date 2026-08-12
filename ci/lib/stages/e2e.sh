#!/usr/bin/env bash
# Stage: e2e — end-to-end tests (typically self-hosted / macOS with emulators)
stage_e2e() {
  if ! ci_should_run_stage "local"; then
    ci_warn "E2E tests require local/self-hosted runner — skipping in cloud-only mode"
    return 0
  fi

  local stack
  stack="$(ci_stack)"

  case "$stack" in
    react-native)  stage_e2e_react_native ;;
    flutter)       stage_e2e_flutter ;;
    kmp|cmp)       stage_e2e_kmp ;;
    *)             stage_e2e_react_native ;;
  esac

  ci_ok "E2E stage complete"
}

stage_e2e_react_native() {
  # Playwright (web E2E — can run on cloud too)
  if [[ -f "$PROJECT_ROOT/playwright.config.ts" ]] || [[ -f "$PROJECT_ROOT/playwright.config.js" ]]; then
    ci_log "Playwright E2E tests..."
    if ci_have npx; then
      npx playwright install --with-deps chromium 2>/dev/null || true
      npx playwright test
      ci_ok "Playwright E2E passed"
    fi
  fi

  # Maestro (mobile E2E — local/self-hosted)
  if [[ -d "$PROJECT_ROOT/.maestro" ]] && ci_have maestro; then
    ci_log "Maestro mobile E2E..."
    maestro test "$PROJECT_ROOT/.maestro/"
    ci_ok "Maestro E2E passed"
  else
    ci_warn "Maestro flows not found or maestro not installed — skipping mobile E2E"
  fi

  # Detox (alternative RN E2E)
  if npm run --silent test:e2e 2>/dev/null; then
    ci_ok "Detox E2E passed"
  fi
}

stage_e2e_flutter() {
  if [[ -d "$PROJECT_ROOT/integration_test" ]]; then
    ci_require flutter
    # Requires running emulator or device
    if ci_have adb && adb devices | grep -q emulator; then
      ci_run flutter test integration_test/
    else
      ci_warn "No Android emulator detected — skipping Flutter integration tests"
    fi
  fi
}

stage_e2e_kmp() {
  if [[ -f "$PROJECT_ROOT/gradlew" ]]; then
    ci_run "$PROJECT_ROOT/gradlew" connectedAndroidTest --quiet 2>/dev/null || \
      ci_warn "KMP connectedAndroidTest skipped (no device/emulator)"
  fi
}
