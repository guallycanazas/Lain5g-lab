#!/usr/bin/env bash
set -euo pipefail
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
env_file="$script_dir/../../common/.env"
[ -f "$env_file" ] && set -a && source "$env_file" && set +a
addr="${USRP_ADDR:-192.168.10.2}"
if ! command -v uhd_usrp_probe >/dev/null 2>&1; then echo "uhd_available NOT_TESTED uhd_usrp_probe not installed"; exit 1; fi
uhd_usrp_probe --args "addr=$addr" 2>&1 | tee /tmp/lain5g-uhd-probe.log
grep -Eiq 'fpga|firmware|x3|x310' /tmp/lain5g-uhd-probe.log && echo "uhd_probe PASS probe completed" || { echo "uhd_probe WARNING probe output did not include expected X310 markers"; exit 1; }
if grep -Eiq 'compatible|compat' /tmp/lain5g-uhd-probe.log; then echo "uhd_fpga_compatible PASS compatibility marker found"; else echo "uhd_fpga_compatible WARNING compatibility could not be proven"; fi
