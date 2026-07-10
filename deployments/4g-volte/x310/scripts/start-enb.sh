#!/usr/bin/env bash
set -euo pipefail
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
scenario_dir="$(cd "$script_dir/.." && pwd)"
repo_dir="$(cd "$scenario_dir/../../.." && pwd)"
manifest="$scenario_dir/rf/safety-manifest.yaml"
if [ "${LAIN5G_ALLOW_RF_START:-false}" != "true" ]; then echo "RF start refused: set LAIN5G_ALLOW_RF_START=true" >&2; exit 2; fi
if [ -f "$scenario_dir/.rf-active" ]; then echo "RF session already active" >&2; exit 2; fi
run_id="${LAIN5G_RUN_ID:-run-$(date -u +%Y%m%d-%H%M%S)}"
run_dir="$repo_dir/runs/$run_id"
mkdir -p "$run_dir/logs"
LAIN5G_RUN_ID="$run_id" "$script_dir/preflight.sh"
duration="$(sed -n 's/^maximum_duration_seconds:[[:space:]]*//p' "$manifest" | head -n1)"
if [ "${LAIN5G_DRY_RUN:-false}" = "true" ]; then echo "DRY RUN: docker compose --profile rf up enb-x310 for ${duration}s"; exit 0; fi
printf '%s\nrun_id=%s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$run_id" > "$scenario_dir/.rf-active"
cleanup(){ (cd "$scenario_dir" && docker compose --env-file ../common/.env -f docker-compose.yml --profile rf logs --no-color enb-x310 >"$run_dir/logs/enb-x310.log" 2>/dev/null || true); (cd "$scenario_dir" && docker compose --env-file ../common/.env -f docker-compose.yml stop enb-x310 >/dev/null 2>&1 || true); rm -f "$scenario_dir/.rf-active"; }
trap cleanup EXIT INT TERM
(cd "$scenario_dir" && docker compose --env-file ../common/.env -f docker-compose.yml --profile rf up -d enb-x310)
sleep "$duration"
echo "RF session auto-stopped after ${duration}s"
echo "Logs written to ${run_dir#$repo_dir/}/logs/enb-x310.log"
