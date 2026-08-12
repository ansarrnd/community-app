#!/usr/bin/env bash
# Stage: build — compile release artifacts for all platforms
stage_build() {
  ci_should_run_stage "any" || return 0

  local stack
  stack="$(ci_stack)"

  case "$stack" in
    react-native)  stage_build_react_native ;;
    flutter)       stage_build_flutter ;;
    kmp|cmp)       stage_build_kmp ;;
    kotlin-java)   stage_build_kotlin_java ;;
    swift|objc)    stage_build_ios ;;
    *)             stage_build_react_native ;;
  esac

  ci_ok "Build stage complete"
}

stage_build_react_native() {
  # Web export (cloud)
  if [[ -f "$PROJECT_ROOT/package.json" ]]; then
    ci_log "Building web bundle..."
    npm run build:web 2>/dev/null || npx expo export --platform web 2>/dev/null || \
      ci_warn "Web build skipped"
    if [[ -d "$PROJECT_ROOT/dist" ]]; then
      ci_save_artifact "$PROJECT_ROOT/dist" "web-dist"
    fi
  fi

  # Android APK/AAB (cloud)
  if [[ -d "$PROJECT_ROOT/android" && -f "$PROJECT_ROOT/android/gradlew" ]]; then
    ci_run_or_skip cloud "$PROJECT_ROOT/android/gradlew" assembleRelease bundleRelease --quiet
    local apk_dir="$PROJECT_ROOT/android/app/build/outputs"
    if [[ -d "$apk_dir" ]]; then
      ci_save_artifact "$apk_dir" "android-build"
    fi
  fi

  # iOS archive (local/macOS)
  if ci_is_macos && [[ -d "$PROJECT_ROOT/ios" ]]; then
    ci_run_or_skip local stage_build_ios_archive
  fi
}

stage_build_flutter() {
  ci_require flutter
  ci_run flutter build apk --release
  ci_run flutter build appbundle --release
  if ci_is_macos; then
    ci_run_or_skip local flutter build ios --release --no-codesign
  fi
  ci_run flutter build web --release 2>/dev/null || true
}

stage_build_kmp() {
  if [[ ! -f "$PROJECT_ROOT/gradlew" ]]; then return 0; fi

  ci_run "$PROJECT_ROOT/gradlew" :shared:assembleRelease --quiet 2>/dev/null || true
  ci_run_or_skip cloud "$PROJECT_ROOT/gradlew" :androidApp:assembleRelease bundleRelease --quiet
  if ci_is_macos; then
    ci_run_or_skip local "$PROJECT_ROOT/gradlew" :iosApp:assembleRelease --quiet 2>/dev/null || true
  fi
  # CMP desktop
  ci_run_or_skip any "$PROJECT_ROOT/gradlew" :desktopApp:packageReleaseDistribution --quiet 2>/dev/null || true
}

stage_build_kotlin_java() {
  if [[ -f "$PROJECT_ROOT/gradlew" ]]; then
    ci_run "$PROJECT_ROOT/gradlew" assembleRelease --quiet
  elif [[ -f "$PROJECT_ROOT/pom.xml" ]]; then
    ci_run mvn package -DskipTests -q
  fi
}

stage_build_ios() {
  if ! ci_is_macos; then
    ci_warn "iOS build requires macOS — skipping"
    return 0
  fi
  stage_build_ios_archive
}

stage_build_ios_archive() {
  local ios_dir="$PROJECT_ROOT/ios"
  local xcodeproj
  xcodeproj=$(find "$ios_dir" -maxdepth 1 -name "*.xcworkspace" -o -name "*.xcodeproj" 2>/dev/null | head -1)
  if [[ -z "$xcodeproj" ]]; then return 0; fi

  local scheme
  scheme=$(ci_config_get "ios_scheme" "$(basename "$xcodeproj" | sed 's/\.[^.]*$//')")

  ci_log "Archiving iOS (scheme: $scheme)..."

  local archive_path
  archive_path="$(ci_artifact_dir)/${scheme}.xcarchive"

  if [[ "$xcodeproj" == *.xcworkspace ]]; then
    xcodebuild archive \
      -workspace "$xcodeproj" \
      -scheme "$scheme" \
      -archivePath "$archive_path" \
      -destination "generic/platform=iOS" \
      CODE_SIGNING_ALLOWED=NO \
      -quiet
  else
    xcodebuild archive \
      -project "$xcodeproj" \
      -scheme "$scheme" \
      -archivePath "$archive_path" \
      -destination "generic/platform=iOS" \
      CODE_SIGNING_ALLOWED=NO \
      -quiet
  fi

  ci_ok "iOS archive: $archive_path"
}
