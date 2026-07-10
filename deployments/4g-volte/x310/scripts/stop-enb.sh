#!/usr/bin/env bash
set -euo pipefail
scenario_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
rm -f "$scenario_dir/.rf-active"
if [ "${LAIN5G_DRY_RUN:-false}" = "true" ]; then echo "DRY RUN: docker compose --profile rf stop enb-x310"; exit 0; fi
(cd "$scenario_dir" && docker compose --env-file ../common/.env -f docker-compose.yml --profile rf stop enb-x310)
