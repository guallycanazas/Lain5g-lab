#!/usr/bin/env bash
set -euo pipefail
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
scenario_dir="$(cd "$script_dir/.." && pwd)"
manifest="$scenario_dir/rf/safety-manifest.yaml"
if [ "${LAIN5G_ALLOW_RF_START:-false}" != "true" ]; then echo "RF start refused: set LAIN5G_ALLOW_RF_START=true" >&2; exit 2; fi
if [ -f "$scenario_dir/.rf-active" ]; then echo "RF session already active" >&2; exit 2; fi
"$script_dir/preflight.sh"
duration="$(sed -n 's/^maximum_duration_seconds:[[:space:]]*//p' "$manifest" | head -n1)"
if [ "${LAIN5G_DRY_RUN:-false}" = "true" ]; then echo "DRY RUN: docker compose --profile rf up enb-x310 for ${duration}s"; exit 0; fi
date -u +%Y-%m-%dT%H:%M:%SZ > "$scenario_dir/.rf-active"
trap 'rm -f "$scenario_dir/.rf-active"' EXIT
(cd "$scenario_dir" && docker compose --env-file ../common/.env -f docker-compose.yml --profile rf up -d enb-x310)
sleep "$duration"
(cd "$scenario_dir" && docker compose --env-file ../common/.env -f docker-compose.yml stop enb-x310)
echo "RF session auto-stopped after ${duration}s"
