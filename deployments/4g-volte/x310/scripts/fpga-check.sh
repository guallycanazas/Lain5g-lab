#!/usr/bin/env bash
set -euo pipefail
"$(dirname "${BASH_SOURCE[0]}")/uhd-check.sh" >/tmp/lain5g-fpga-check.log 2>&1 || true
if grep -Eiq 'incompatible|compat number mismatch|Expected FPGA' /tmp/lain5g-fpga-check.log; then echo "fpga_status=incompatible"; exit 1; fi
if grep -Eiq 'uhd_fpga_compatible PASS|FPGA Version|fpga:' /tmp/lain5g-fpga-check.log; then echo "fpga_status=compatible"; else echo "fpga_status=unknown"; exit 1; fi
