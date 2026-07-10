#!/usr/bin/env bash
set -euo pipefail
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
scenario_dir="$(cd "$script_dir/.." && pwd)"
env_file="$scenario_dir/.env"
manifest="$scenario_dir/rf/safety-manifest.yaml"
if [ "${LAIN5G_DRY_RUN:-false}" = true ]; then
  LAIN5G_DRY_RUN=true "$script_dir/preflight.sh"
  echo "DRY RUN: docker compose --profile rf up -d gnb-x310"
  exit 0
fi
if [ "${LAIN5G_ALLOW_5G_RF_START:-false}" != true ]; then echo "5G RF start refused: set LAIN5G_ALLOW_5G_RF_START=true" >&2; exit 2; fi
[ -f "$env_file" ] || { echo "5G RF start refused: missing deployments/5g-sa-x310/.env" >&2; exit 2; }
[ -f "$manifest" ] || { echo "5G RF start refused: missing rf/safety-manifest.yaml" >&2; exit 2; }
if [ -f "$scenario_dir/.rf-active" ]; then echo "5G RF session already active" >&2; exit 2; fi
REQUIRE_RF_READY=true "$script_dir/preflight.sh"
duration="$(sed -n 's/^maximum_duration_seconds:[[:space:]]*//p' "$manifest" | head -n1)"
printf 'started_at=%s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" > "$scenario_dir/.rf-active"
cleanup(){ (cd "$scenario_dir" && docker compose --env-file "$env_file" -f docker-compose.yml --profile rf logs --no-color gnb-x310 > gnb/.runtime/gnb-x310.log 2>/dev/null || true); (cd "$scenario_dir" && docker compose --env-file "$env_file" -f docker-compose.yml --profile rf stop gnb-x310 >/dev/null 2>&1 || true); rm -f "$scenario_dir/.rf-active"; }
trap cleanup EXIT INT TERM
(cd "$scenario_dir" && docker compose --env-file "$env_file" -f docker-compose.yml --profile rf up -d gnb-x310)
sleep "$duration"
echo "5G RF session auto-stopped after ${duration}s"
