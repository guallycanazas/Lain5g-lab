#!/usr/bin/env bash
set -euo pipefail
scenario_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
repo_dir="$(cd "$scenario_dir/../../.." && pwd)"
mkdir -p "$repo_dir/runs"
rm -f "$scenario_dir/.rf-active"
reason="${REASON:-operator emergency stop}"
reason="${reason//\"/\\\"}"
printf '{"stopped_at":"%s","reason":"%s"}\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$reason" > "$repo_dir/runs/x310-emergency-stop.json"
if [ "${LAIN5G_DRY_RUN:-false}" = "true" ]; then echo "DRY RUN: docker compose --profile rf stop enb-x310"; exit 0; fi
(cd "$scenario_dir" && docker compose --env-file ../common/.env -f docker-compose.yml --profile rf stop enb-x310 || true)
