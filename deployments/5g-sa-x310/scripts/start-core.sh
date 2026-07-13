#!/usr/bin/env bash
set -euo pipefail
scenario_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
env_file="$scenario_dir/.env"; [ -f "$env_file" ] || env_file="$scenario_dir/.env.example"
services=(mongo nrf ausf udm udr pcf upf smf amf)
if [ "${LAIN5G_DRY_RUN:-false}" = true ]; then echo "DRY RUN: docker compose up -d ${services[*]}"; exit 0; fi
(cd "$scenario_dir" && docker compose --env-file "$env_file" -f docker-compose.yml up -d "${services[@]}")

set -a
source "$env_file"
set +a

upf_ip="$(cd "$scenario_dir" && docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' lain5g-lab-5g-sa-x310-upf 2>/dev/null || true)"
if [ -z "$upf_ip" ]; then
  echo "WARNING: UPF IP not found; host UE route was not installed" >&2
  exit 0
fi

route_cmd=(ip route replace)
if [ "${EUID:-$(id -u)}" -ne 0 ]; then
  if sudo -n true 2>/dev/null; then
    route_cmd=(sudo -n ip route replace)
  else
    echo "WARNING: sudo is required to install host UE route" >&2
    exit 0
  fi
fi

ue_subnet="${UE_SUBNET:-10.45.0.0/16}"
"${route_cmd[@]}" "$ue_subnet" via "$upf_ip"
echo "Installed host route: $ue_subnet via $upf_ip"
