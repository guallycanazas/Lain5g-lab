#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -eq 0 ]; then
  echo "Usage: <open5gs-binary> -c <config-file>" >&2
  exit 64
fi

exec "$@"
