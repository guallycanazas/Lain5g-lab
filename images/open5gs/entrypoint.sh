#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -eq 0 ]; then
  echo "Usage: <open5gs-binary> -c <config-file>" >&2
  exit 64
fi

if [ "$(basename "$1")" = "open5gs-upfd" ]; then
  ue_subnet="${UE_SUBNET:-10.45.0.0/16}"
  ue_gateway="${UE_GATEWAY:-10.45.0.1}"
  ue_prefix="${ue_subnet#*/}"

  if [ "$ue_prefix" = "$ue_subnet" ]; then
    ue_prefix="16"
  fi

  ip tuntap add name ogstun mode tun 2>/dev/null || true
  ip addr replace "${ue_gateway}/${ue_prefix}" dev ogstun
  ip link set ogstun up
  iptables -t nat -C POSTROUTING -s "$ue_subnet" ! -o ogstun -j MASQUERADE 2>/dev/null \
    || iptables -t nat -A POSTROUTING -s "$ue_subnet" ! -o ogstun -j MASQUERADE
fi

exec "$@"
