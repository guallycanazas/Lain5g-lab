#!/usr/bin/env bash
set -euo pipefail
if ! command -v uhd_usrp_probe >/dev/null 2>&1; then echo "fpga_status=unknown reason=uhd_usrp_probe_missing"; exit 1; fi
"$(dirname "${BASH_SOURCE[0]}")/uhd-check.sh" >/tmp/lain5g-fpga-check.log 2>&1 || true
if grep -Eiq 'incompatible|compat number mismatch|Expected FPGA' /tmp/lain5g-fpga-check.log; then echo "fpga_status=incompatible"; exit 1; fi
if grep -Eiq 'FPGA|compat' /tmp/lain5g-fpga-check.log; then echo "fpga_status=compatible"; else echo "fpga_status=unknown"; fi
