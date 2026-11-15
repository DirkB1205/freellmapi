cd E:\AI-System 3.0
Write-Host "Checking AI-SYSTEM status..." -ForegroundColor Cyan

node check.js 2>/dev/null || Write-Host "Cannot run Node script"

echo ""
echo "=== log.js patch verification ==="
if [ -f "E:\AI-System 3.0\code\AI-SYSTEM\src\log.js" ]; then
  if grep -q 'try.*console\.log' E:\AI-System 3.0\code\AI-SYSTEM\src\log.js; then
    Write-Host "FAIL: log.js PATCHED (logging blocked)" -ForegroundColor Red
  else
    Write-Host "OK: log.js unpatched" -ForegroundColor Green
  fi
else
  Write-Host "FILE NOT FOUND" -ForegroundColor Yellow
fi

echo ""
echo "=== Process status ==="
if [ -d "E:\AI-System 3.0\code\AI-SYSTEM\data" ]; then
  if test -f "E:\AI-System 3.0\code\AI-SYSTEM\data\ai-system.lock"; then
    Write-Host "FAIL: Stale lock file found" -ForegroundColor Red
    powershell -Command "Get-Process | Where-Object {$_.Path -match '.*\\AI-System.*'}.Name"
  else
    Write-Host "OK: No stale lock file" -ForegroundColor Green
  fi
else
  Write-Host "Working directory changed" -ForegroundColor Yellow
fi

echo ""
echo "=== Core.js entry point ==="
if [ -f "E:\AI-System 3.0\code\AI-SYSTEM\core.js" ]; then
  if grep -q 'uncaughtException' E:\AI-System 3.0\code\AI-SYSTEM\core.js; then
    Write-Host "FAIL: No uncaughtException handler in core.js" -ForegroundColor Red
  else
    Write-Host "OK: Has uncaughtException handler" -ForegroundColor Green
  fi
else
  Write-Host "core.js NOT FOUND" -ForegroundColor Yellow
fi
