# Eval-Gate: ESLint
# Usage: .ecc/validators/eslint-check.ps1 -Path "<project-dir>" -Pattern "src/**/*.{ts,tsx}"

param(
  [string]$Path = ".",
  [string]$Pattern = "src/**/*.{ts,tsx}"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path (Join-Path $Path "package.json"))) {
  Write-Host "SKIP: No package.json in $Path"
  exit 0
}

try {
  & npx eslint $Pattern 2>&1
  if ($LASTEXITCODE -ne 0) {
    Write-Host "FAIL: eslint errors detected"
    exit 1
  }
  Write-Host "PASS: eslint"
  exit 0
} catch {
  Write-Host "WARN: eslint not configured, skipping"
  exit 0
}
