#!/bin/bash
# ============================================================
# FitEmpire — Automated Post-Deployment Smoke Test Suite
# ============================================================

set -euo pipefail

BASE_URL="${1:-http://localhost:8080}"
TIMEOUT_SECS=5
MAX_RETRIES=10
RETRY_DELAY=3

echo "============================================================"
echo " FitEmpire Post-Deployment Smoke Test Validation"
echo " Target Base URL: ${BASE_URL}"
echo "============================================================"

# Helper function to check an endpoint
check_endpoint() {
  local endpoint="$1"
  local expected_status="${2:-200}"
  local url="${BASE_URL}${endpoint}"
  
  echo -n "[CHECK] Testing ${endpoint} (expecting HTTP ${expected_status})... "
  
  local response
  response=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout "${TIMEOUT_SECS}" "${url}" || echo "000")
  
  if [ "${response}" -eq "${expected_status}" ]; then
    echo "PASSED (HTTP ${response})"
    return 0
  else
    echo "FAILED (HTTP ${response})"
    return 1
  fi
}

# 1. Wait for Actuator Health to report UP
echo "[INFO] Waiting for service health readiness..."
ready=0
for i in $(seq 1 "${MAX_RETRIES}"); do
  status=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout "${TIMEOUT_SECS}" "${BASE_URL}/api/v1/actuator/health" 2>/dev/null || echo "000")
  if [ "${status}" -eq 200 ]; then
    ready=1
    echo "[INFO] Service reported healthy on attempt ${i}."
    break
  fi
  echo "[WAIT] Attempt ${i}/${MAX_RETRIES}: Service not ready yet (HTTP ${status}). Retrying in ${RETRY_DELAY}s..."
  sleep "${RETRY_DELAY}"
done

if [ "${ready}" -ne 1 ]; then
  echo "[CRITICAL] Service failed readiness check after ${MAX_RETRIES} attempts. Aborting deployment!"
  exit 1
fi

# 2. Run core endpoint smoke suite
failures=0

check_endpoint "/api/v1/actuator/health" 200 || failures=$((failures + 1))
check_endpoint "/api/v1/gyms" 200 || failures=$((failures + 1))
check_endpoint "/api/v1/plans" 200 || failures=$((failures + 1))
check_endpoint "/api/v1/ecosystem/food" 200 || failures=$((failures + 1))
check_endpoint "/api/v1/ecosystem/store" 200 || failures=$((failures + 1))
check_endpoint "/api/v1/ecosystem/care" 200 || failures=$((failures + 1))

echo "------------------------------------------------------------"
if [ "${failures}" -eq 0 ]; then
  echo "[SUCCESS] All post-deployment smoke tests PASSED! Deployment is verified healthy."
  exit 0
else
  echo "[FAILURE] ${failures} smoke test(s) FAILED! Rolling back deployment."
  exit 1
fi
