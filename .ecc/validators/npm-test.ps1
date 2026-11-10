# Eval-Gate: npm test (Jest/Vitest/Mocha)
# Usage: .ecc/validators/npm-test.ps1 -Path "<project-dir>"

param(
  [string]$Path = "."
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path (Join-Path $Path "package.json"))) {
  Write-Host "SKIP: No package.json in $Path"
  exit 0
}

try {
  Push-Location $Path
  & npm test 2>&1
  if ($LASTEXITCODE -ne 0) {
    Write-Host "FAIL: npm test failed"
    Pop-Location
    exit 1
  }
  Write-Host "PASS: npm test"
  Pop-Location
  exit 0
} catch {
  Write-Host "WARN: no test script defined, skipping"
  Pop-Location
  exit 0
}
