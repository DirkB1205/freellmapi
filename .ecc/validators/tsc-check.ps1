# Eval-Gate: TypeScript Type-Check
# Usage: .ecc/validators/tsc-check.ps1 -Path "<project-dir>"

param(
  [string]$Path = ".",
  [string]$TsConfig = "tsconfig.json"
)

$ErrorActionPreference = "Stop"
$tsConfigPath = Join-Path $Path $TsConfig

if (-not (Test-Path $tsConfigPath)) {
  Write-Host "SKIP: No tsconfig.json in $Path"
  exit 0
}

try {
  & npx tsc --noEmit --project $tsConfigPath 2>&1
  if ($LASTEXITCODE -ne 0) {
    Write-Host "FAIL: tsc type errors detected"
    exit 1
  }
  Write-Host "PASS: tsc type check"
  exit 0
} catch {
  Write-Host "FAIL: $($_.Exception.Message)"
  exit 1
}
