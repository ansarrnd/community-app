#!/usr/bin/env bash
# Install CI tooling for local development (Linux + macOS)
set -euo pipefail

CI_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$CI_ROOT/lib/common.sh"

install_gitleaks() {
  if ci_have gitleaks; then
    ci_ok "gitleaks already installed"
    return
  fi
  ci_log "Installing gitleaks..."
  if ci_is_macos && ci_have brew; then
    brew install gitleaks
  else
    local version="8.18.4"
    local os arch
    os="$(uname -s | tr '[:upper:]' '[:lower:]')"
    arch="$(uname -m)"
    [[ "$arch" == "x86_64" ]] && arch="x64"
    [[ "$arch" == "aarch64" || "$arch" == "arm64" ]] && arch="arm64"
    local url="https://github.com/gitleaks/gitleaks/releases/download/v${version}/gitleaks_${version}_${os}_${arch}.tar.gz"
    curl -fsSL "$url" | tar -xz -C /tmp
    sudo mv /tmp/gitleaks /usr/local/bin/gitleaks 2>/dev/null || mv /tmp/gitleaks "$HOME/.local/bin/gitleaks"
  fi
  ci_ok "gitleaks installed"
}

install_semgrep() {
  if ci_have semgrep; then
    ci_ok "semgrep already installed"
    return
  fi
  ci_log "Installing semgrep..."
  if ci_have pip3; then
    pip3 install semgrep
  elif ci_have brew; then
    brew install semgrep
  else
    ci_fail "Install Python pip or Homebrew to install semgrep"
  fi
  ci_ok "semgrep installed"
}

install_maestro() {
  if ci_have maestro; then
    ci_ok "maestro already installed"
    return
  fi
  ci_log "Installing Maestro..."
  curl -fsSL "https://get.maestro.mobile.dev" | bash
  ci_ok "maestro installed (add ~/.maestro/bin to PATH)"
}

main() {
  ci_log "Installing CI dependencies for $(ci_os)..."
  install_gitleaks
  install_semgrep

  if [[ "${1:-}" == "--all" ]]; then
    install_maestro
  fi

  ci_ok "CI tooling ready. Run: ./ci/run.sh"
}

main "$@"
