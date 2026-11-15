cd E:\AI-System 3.0
Write-Host "Checking AI-SYSTEM status..." -ForegroundColor Cyan
$nodeExit = (node check.js 2>$null).exitcode
if ($nodeExit -ne 0) { Write-Host "Cannot run Node script" }

echo ""
echo "=== log.js patch verification ==="
if ((Test-Path "E:\AI-System 3.0\code\AI-SYSTEM\src\log.js") -and (Get-Content "E:\AI-System 3.0\code\AI-SYSTEM\src\log.js" | Select-String -Pattern 'try.*console\.log' -AllMatches)) {
  Write-Host "FAIL: log.js PATCHED (logging blocked)" -ForegroundColor Red
} else {
  Write-Host "OK: log.js unpatched" -ForegroundColor Green
}

echo ""
echo "=== Process status ==="
if ((Test-Path "E:\AI-System 3.0\code\AI-SYSTEM\data") -and (Test-Path "E:\AI-System 3.0\code\AI-SYSTEM\data\ai-system.lock")) {
  Write-Host "FAIL: Stale lock file found" -ForegroundColor Red
} else {
  Write-Host "OK: No stale lock file" -ForegroundColor Green
}

echo ""
echo "=== Core.js entry point ==="
if ((Test-Path "E:\AI-System 3.0\code\AI-SYSTEM\core.js") -and (Get-Content "E:\AI-System 3.0\code\AI-SYSTEM\core.js" -Raw | Select-String -Pattern 'uncaughtException' -AllMatches)) {
  Write-Host "FAIL: No uncaughtException handler in core.js" -ForegroundColor Red
} else {
  Write-Host "OK: Has uncaughtException handler" -ForegroundColor Green
}
