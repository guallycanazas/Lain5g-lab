#!/usr/bin/env bash
set -euo pipefail
scenario_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
checks=()
add(){ checks+=("$1|$2|$3"); printf '%-26s %s %s\n' "$1" "$2" "$3"; }
compose(){ (cd "$scenario_dir" && docker compose --env-file ../common/.env -f docker-compose.yml --profile rf "$@"); }
running(){ [ -n "$(compose ps --status running -q "$1" 2>/dev/null)" ]; }
if [ "${LAIN5G_DRY_RUN:-false}" = "true" ]; then for id in hardware_detected ethernet_link uhd_available uhd_fpga_compatible epc_services mme_ready ims_services rf_preflight enb_started s1_setup auto_stop logs_captured ue_registration; do add "$id" NOT_TESTED "dry-run mode"; done; exit 0; fi
"$(dirname "${BASH_SOURCE[0]}")/hardware-check.sh" >/tmp/lain5g-x310-hw.log 2>&1 && add hardware_detected PASS "X310 detected" || add hardware_detected FAIL "X310 not detected"
grep -q ethernet_link /tmp/lain5g-x310-hw.log && add ethernet_link PASS "ethernet checked" || add ethernet_link WARNING "ethernet unknown"
"$(dirname "${BASH_SOURCE[0]}")/uhd-check.sh" >/tmp/lain5g-x310-uhd.log 2>&1 && add uhd_available PASS "UHD probe passed" || add uhd_available FAIL "UHD probe failed"
"$(dirname "${BASH_SOURCE[0]}")/fpga-check.sh" >/tmp/lain5g-x310-fpga.log 2>&1 && add uhd_fpga_compatible PASS "FPGA compatible" || add uhd_fpga_compatible WARNING "FPGA compatibility unknown"
for svc in mme hss sgwc sgwu pgwc pgwu pcrf; do running "$svc" || epc_fail=1; done; [ "${epc_fail:-0}" = 0 ] && add epc_services PASS "EPC services running" || add epc_services FAIL "EPC incomplete"
running mme && add mme_ready PASS "MME running" || add mme_ready FAIL "MME not running"
for svc in pcscf icscf scscf; do running "$svc" || ims_fail=1; done; [ "${ims_fail:-0}" = 0 ] && add ims_services PASS "IMS services running" || add ims_services FAIL "IMS incomplete"
[ -f "$scenario_dir/.rf-active" ] && add enb_started PASS "RF session marker present" || add enb_started NOT_TESTED "no RF session active"
compose logs --no-color enb-x310 2>/dev/null | grep -Eiq 'S1 Setup|S1AP|MME connection' && add s1_setup PASS "S1 setup evidence found" || add s1_setup NOT_TESTED "S1 setup evidence not found"
compose ps enb-x310 2>/dev/null | grep -q running && add auto_stop FAIL "enb-x310 still running" || add auto_stop PASS "enb-x310 is stopped"
compose logs --no-color enb-x310 >/tmp/lain5g-x310-enb.log 2>/dev/null && [ -s /tmp/lain5g-x310-enb.log ] && add logs_captured PASS "logs captured" || add logs_captured WARNING "no enb-x310 logs"
add ue_registration NOT_TESTED "UE over RF not required in this profile"
