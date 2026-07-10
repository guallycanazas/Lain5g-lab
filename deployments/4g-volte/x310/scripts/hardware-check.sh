#!/usr/bin/env bash
set -euo pipefail
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
env_file="$script_dir/../../common/.env"
[ -f "$env_file" ] && set -a && source "$env_file" && set +a
addr="${USRP_ADDR:-192.168.10.2}"
status=PASS
check(){ printf '%-22s %s %s\n' "$1" "$2" "$3"; [ "$2" = FAIL ] && status=FAIL; }
ip -o addr show | grep -Eq '192\.168\.(10|30)\.' && check ethernet_link PASS "compatible local subnet found" || check ethernet_link WARNING "no typical X310 local subnet found"
ping -c 1 -W 1 "$addr" >/dev/null 2>&1 && check x310_ping PASS "X310 responds at $addr" || { check x310_ping FAIL "X310 did not respond at $addr"; }
if command -v uhd_find_devices >/dev/null 2>&1; then
  out="$(uhd_find_devices --args "addr=$addr" 2>&1 || true)"
  printf '%s\n' "$out" > /tmp/lain5g-uhd-find-devices.log
  serial="$(printf '%s\n' "$out" | sed -n 's/.*serial: *//Ip' | head -n1)"
  [ -n "$serial" ] && echo "serial_redacted=${serial:0:3}***${serial: -2}"
else
  check uhd_find_devices NOT_TESTED "uhd_find_devices not installed on host"
fi
echo "status=$status"
test "$status" != FAIL
