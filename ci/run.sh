#!/usr/bin/env bash
# Entry point for portable CI/CD.
exec "$(dirname "$0")/lib/runner.sh" "$@"
