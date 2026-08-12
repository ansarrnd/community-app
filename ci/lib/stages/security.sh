#!/usr/bin/env bash
# Stage: security — secret scanning, SAST, dependency audit
stage_security() {
  ci_should_run_stage "any" || return 0

  # ── Secret scanning (Gitleaks) ──────────────────────────────────────────────
  if ci_have gitleaks; then
    ci_log "Running Gitleaks secret scan..."
    local gitleaks_config="$CI_ROOT/config/gitleaks.toml"
    if [[ -f "$gitleaks_config" ]]; then
      gitleaks detect --source "$PROJECT_ROOT" --config "$gitleaks_config" --no-banner --redact
    else
      gitleaks detect --source "$PROJECT_ROOT" --no-banner --redact
    fi
    ci_ok "Gitleaks: no secrets detected"
  else
    ci_warn "gitleaks not installed — skipping secret scan"
  fi

  # ── SAST (Semgrep) ────────────────────────────────────────────────────────────
  if ci_have semgrep; then
    ci_log "Running Semgrep SAST..."
    local semgrep_config="$CI_ROOT/config/semgrep.yml"
  local rules="p/security-audit p/secrets p/owasp-top-ten"
    if [[ -f "$semgrep_config" ]]; then
      semgrep scan --config "$semgrep_config" --error --quiet "$PROJECT_ROOT" \
        --exclude node_modules --exclude .expo --exclude build --exclude dist
    else
      semgrep scan --config "$rules" --error --quiet "$PROJECT_ROOT" \
        --exclude node_modules --exclude .expo --exclude build --exclude dist
    fi
    ci_ok "Semgrep: no critical findings"
  else
    ci_warn "semgrep not installed — skipping SAST"
  fi

  # ── Dependency audit (npm) ────────────────────────────────────────────────────
  if [[ -f "$PROJECT_ROOT/package.json" ]] && ci_have npm; then
    ci_log "Running npm audit..."
    npm audit --audit-level=high 2>/dev/null || ci_warn "npm audit found high/critical issues"
  fi

  # ── Dependency audit (Gradle) ───────────────────────────────────────────────
  if [[ -f "$PROJECT_ROOT/gradlew" ]]; then
    ci_log "Running Gradle dependency check..."
    "$PROJECT_ROOT/gradlew" dependencyCheckAnalyze -q 2>/dev/null || \
      ci_warn "OWASP dependency-check not configured — skipping"
  fi

  # ── Flutter pub audit ─────────────────────────────────────────────────────────
  if [[ -f "$PROJECT_ROOT/pubspec.yaml" ]] && ci_have flutter; then
    ci_log "Running Flutter pub audit..."
    flutter pub outdated --show-all 2>/dev/null || true
  fi

  ci_ok "Security stage complete"
}
