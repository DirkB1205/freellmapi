#!/usr/bin/env bash
# verify.sh — Codeguardian Verification Pipeline
# Exit codes: 0 = success, 1 = test failure, 2 = lint/type error, 3 = other

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo "=== verify.sh: json2csv ==="
echo "Project: $PROJECT_DIR"
echo "Date: $(date -Iseconds)"

# 1. Python syntax check
echo "--- Python syntax check ---"
python -m py_compile src/json2csv.py || exit 2

# 2. Run doctests (pytest with doctest plugin)
echo "--- Doctests (pytest) ---"
python -m pytest src/json2csv.py --doctest-modules -v 2>&1
TEST_EXIT=$?

if [ $TEST_EXIT -ne 0 ]; then
    echo "FAIL: Doctests exited with code $TEST_EXIT"
    exit 1
fi

echo "=== ALL CHECKS PASSED ==="
exit 0