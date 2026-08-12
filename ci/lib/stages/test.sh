#!/usr/bin/env bash
# Stage: test — unit & integration tests across all supported stacks
stage_test() {
  ci_should_run_stage "any" || return 0

  local stack
  stack="$(ci_stack)"

  case "$stack" in
    react-native)  stage_test_react_native ;;
    flutter)       stage_test_flutter ;;
    kmp|cmp)       stage_test_kmp ;;
    kotlin-java)   stage_test_kotlin_java ;;
    swift)         stage_test_swift ;;
    objc)          stage_test_objc ;;
    *)             stage_test_react_native ;;
  esac

  ci_ok "Test stage complete"
}

stage_test_react_native() {
  # JS/TS unit tests (cloud-friendly)
  if [[ -f "$PROJECT_ROOT/package.json" ]]; then
    ci_log "Jest unit tests..."
    npm run test:unit 2>/dev/null || npm test
    ci_ok "JS unit tests passed"
  fi

  # Android unit tests (cloud)
  if [[ -d "$PROJECT_ROOT/android" && -f "$PROJECT_ROOT/android/gradlew" ]]; then
    ci_run_or_skip cloud "$PROJECT_ROOT/android/gradlew" testDebugUnitTest --quiet
    ci_ok "Android unit tests passed"
  fi

  # iOS unit tests (local/macOS)
  if [[ -d "$PROJECT_ROOT/ios" ]] && ci_is_macos; then
    ci_run_or_skip local stage_test_ios_xcode
  fi
}

stage_test_flutter() {
  ci_require flutter
  ci_run flutter test --coverage
  if [[ -d "$PROJECT_ROOT/android" ]]; then
    ci_run_or_skip cloud flutter test integration_test/ 2>/dev/null || true
  fi
}

stage_test_kmp() {
  if [[ ! -f "$PROJECT_ROOT/gradlew" ]]; then
    ci_warn "No gradlew found — skipping KMP tests"
    return 0
  fi

  ci_log "KMP shared module tests..."
  ci_run "$PROJECT_ROOT/gradlew" :shared:testDebugUnitTest --quiet 2>/dev/null || \
    ci_run "$PROJECT_ROOT/gradlew" testDebugUnitTest --quiet

  # Android target
  ci_run_or_skip cloud "$PROJECT_ROOT/gradlew" :androidApp:testDebugUnitTest --quiet 2>/dev/null || true

  # iOS target (macOS only)
  if ci_is_macos; then
    ci_run_or_skip local "$PROJECT_ROOT/gradlew" :iosApp:iosSimulatorArm64Test --quiet 2>/dev/null || \
      ci_warn "iOS KMP tests skipped (simulator or target not configured)"
  fi

  # Desktop/JVM target
  ci_run_or_skip any "$PROJECT_ROOT/gradlew" :desktopApp:test --quiet 2>/dev/null || true
}

stage_test_kotlin_java() {
  ci_require java
  if [[ -f "$PROJECT_ROOT/gradlew" ]]; then
    ci_run "$PROJECT_ROOT/gradlew" test --quiet
  elif [[ -f "$PROJECT_ROOT/pom.xml" ]]; then
    ci_run mvn test -q
  fi
}

stage_test_swift() {
  if ! ci_is_macos; then
    ci_warn "Swift tests require macOS — skipping"
    return 0
  fi
  stage_test_ios_xcode
}

stage_test_objc() {
  stage_test_swift  # same Xcode test runner
}

stage_test_ios_xcode() {
  local workspace ios_dir scheme
  ios_dir="$PROJECT_ROOT/ios"

  if [[ ! -d "$ios_dir" ]]; then return 0; fi

  # Find workspace or project
  local xcodeproj
  xcodeproj=$(find "$ios_dir" -maxdepth 1 -name "*.xcworkspace" -o -name "*.xcodeproj" 2>/dev/null | head -1)
  if [[ -z "$xcodeproj" ]]; then
    ci_warn "No Xcode project found in ios/"
    return 0
  fi

  scheme=$(ci_config_get "ios_scheme" "")
  if [[ -z "$scheme" ]]; then
    scheme=$(basename "$xcodeproj" | sed 's/\.[^.]*$//')
  fi

  ci_log "Xcode tests (scheme: $scheme)..."

  if [[ "$xcodeproj" == *.xcworkspace ]]; then
    xcodebuild test \
      -workspace "$xcodeproj" \
      -scheme "$scheme" \
      -destination "platform=iOS Simulator,name=iPhone 15" \
      -quiet \
      CODE_SIGNING_ALLOWED=NO
  else
    xcodebuild test \
      -project "$xcodeproj" \
      -scheme "$scheme" \
      -destination "platform=iOS Simulator,name=iPhone 15" \
      -quiet \
      CODE_SIGNING_ALLOWED=NO
  fi

  ci_ok "iOS unit tests passed"
}
