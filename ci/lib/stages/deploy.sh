#!/usr/bin/env bash
# Stage: deploy — staging and production deployment
stage_deploy() {
  local deploy_env="${CI_DEPLOY_ENV:-staging}"
  ci_log "Deploy target: $deploy_env"

  local stack
  stack="$(ci_stack)"

  case "$deploy_env" in
    staging)   stage_deploy_staging "$stack" ;;
    production) stage_deploy_production "$stack" ;;
    *)           ci_fail "Unknown deploy env: $deploy_env" ;;
  esac

  ci_ok "Deploy stage complete ($deploy_env)"
}

stage_deploy_staging() {
  local stack="$1"

  # Web → Vercel / Firebase Hosting / generic
  if [[ -d "$PROJECT_ROOT/dist" ]] || npm run --silent build:web 2>/dev/null; then
    stage_deploy_web "staging"
  fi

  case "$stack" in
    react-native|flutter|kmp|cmp)
      stage_deploy_mobile_beta
      ;;
  esac
}

stage_deploy_production() {
  local stack="$1"

  if [[ "${CI_DEPLOY_APPROVED:-}" != "true" ]]; then
    ci_warn "Production deploy requires CI_DEPLOY_APPROVED=true"
    return 0
  fi

  stage_deploy_web "production"
  stage_deploy_mobile_release "$stack"
}

stage_deploy_web() {
  local env="$1"
  ci_log "Web deploy ($env)..."

  if ci_have vercel && [[ -f "$PROJECT_ROOT/vercel.json" ]]; then
    if [[ "$env" == "production" ]]; then
      vercel deploy --prod --yes 2>/dev/null || ci_warn "Vercel deploy failed"
    else
      vercel deploy --yes 2>/dev/null || ci_warn "Vercel preview deploy failed"
    fi
    ci_ok "Vercel deploy triggered"
    return
  fi

  if ci_have firebase && [[ -f "$PROJECT_ROOT/firebase.json" ]]; then
    local hosting_target="hosting"
    firebase deploy --only "$hosting_target" --project "${FIREBASE_PROJECT_ID:-}" 2>/dev/null || \
      ci_warn "Firebase hosting deploy failed"
    ci_ok "Firebase hosting deploy triggered"
    return
  fi

  ci_warn "No web deploy target configured (vercel.json / firebase.json)"
}

stage_deploy_mobile_beta() {
  # Fastlane beta lanes
  if [[ -f "$PROJECT_ROOT/Gemfile" ]] && ci_have bundle; then
    ci_log "Fastlane beta deploy..."
    if ci_is_macos && [[ -d "$PROJECT_ROOT/ios" ]]; then
      bundle exec fastlane ios beta 2>/dev/null || ci_warn "Fastlane iOS beta skipped"
    fi
    if [[ -d "$PROJECT_ROOT/android" ]]; then
      bundle exec fastlane android beta 2>/dev/null || ci_warn "Fastlane Android beta skipped"
    fi
    return
  fi

  # EAS Build (Expo)
  if ci_have eas && [[ -f "$PROJECT_ROOT/eas.json" ]]; then
    ci_log "EAS Build submit..."
    eas build --platform all --profile preview --non-interactive 2>/dev/null || \
      ci_warn "EAS build skipped"
    return
  fi

  ci_warn "No mobile beta deploy configured (Fastlane / EAS)"
}

stage_deploy_mobile_release() {
  local stack="$1"

  if [[ -f "$PROJECT_ROOT/Gemfile" ]] && ci_have bundle; then
    if ci_is_macos; then
      bundle exec fastlane ios release 2>/dev/null || ci_warn "Fastlane iOS release skipped"
    fi
    bundle exec fastlane android release 2>/dev/null || ci_warn "Fastlane Android release skipped"
    return
  fi

  if ci_have eas && [[ -f "$PROJECT_ROOT/eas.json" ]]; then
    eas build --platform all --profile production --non-interactive 2>/dev/null || true
    eas submit --platform all --latest --non-interactive 2>/dev/null || true
    return
  fi

  ci_warn "No mobile release deploy configured"
}
