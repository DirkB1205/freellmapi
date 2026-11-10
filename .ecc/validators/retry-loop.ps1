# Retry-Loop mit Eval-Gates und Budget-Tracking
# Usage: .ecc/validators/retry-loop.ps1 -TaskDir "<path>" -MaxRetries 5 -BudgetTokens 100000

param(
  [string]$TaskDir,
  [int]$MaxRetries = 5,
  [int]$BudgetTokens = 100000,
  [hashtable]$Validators = @{}
)

$ErrorActionPreference = "Stop"

$elapsedSec = 0
$maxSeconds = 900  # 15 Minuten Timeout
$usedTokens = 0

Write-Host "[Retry-Loop] Task: $TaskDir | MaxRetries: $MaxRetries | Budget: $BudgetTokens tokens"
Write-Host ""

for ($i = 1; $i -le $MaxRetries; $i++) {
  Write-Host "--- Iteration $i / $MaxRetries ---"
  
  if ($elapsedSec -ge $maxSeconds) {
    Write-Host "FAIL: Timeout exceeded (${maxSeconds}s)"
    exit 1
  }
  
  if ($usedTokens -ge $BudgetTokens) {
    Write-Host "FAIL: Token budget exhausted"
    exit 1
  }
  
  # Run validators
  $allPassed = $true
  
  # Run validators with output capture (accumulate, don't overwrite)
  $failedValidator = $null
  $validatorOutput = ""

  if ($Validators["tsc"] -or (Test-Path (Join-Path $TaskDir "tsconfig.json"))) {
    $tscOut = & "$PSScriptRoot\tsc-check.ps1" -Path $TaskDir 2>&1
    $tscResult = $LASTEXITCODE
    $validatorOutput += "$tscOut`n"
    if ($tscResult -ne 0) { $allPassed = $false; $failedValidator = "tsc" }
  }

  if ($Validators["eslint"] -or (Test-Path (Join-Path $TaskDir "package.json"))) {
    $eslintOut = & "$PSScriptRoot\eslint-check.ps1" -Path $TaskDir 2>&1
    $eslintResult = $LASTEXITCODE
    $validatorOutput += "$eslintOut`n"
    if ($eslintResult -ne 0) { $allPassed = $false; $failedValidator = "eslint" }
  }

  if ($Validators["test"] -or (Test-Path (Join-Path $TaskDir "package.json"))) {
    $testOut = & "$PSScriptRoot\npm-test.ps1" -Path $TaskDir 2>&1
    $testResult = $LASTEXITCODE
    $validatorOutput += "$testOut`n"
    if ($testResult -ne 0) { $allPassed = $false; $failedValidator = "test" }
  }
  
  if ($allPassed) {
    Write-Host ""
    Write-Host "PASS: All validators passed"
    Write-Host "[Stats] Tokens used: $usedTokens/$BudgetTokens | Time: ${elapsedSec}s/${maxSeconds}s"
    exit 0
  }
  
  # Parse errors for escalation context
  $parseResult = & "$PSScriptRoot\error-parser.ps1" -Output $validatorOutput -Source $failedValidator 2>&1
  if ($parseResult) {
    Write-Host "Error Summary: $parseResult"
  }

  # If this is the last retry, escalate
  if ($i -eq $MaxRetries) {
    Write-Host "FAIL: Max retries reached. Escalating..."
    & "$PSScriptRoot\escalate.ps1" -TaskName $TaskDir -Phase "Retry $i" -Reason "Validators failed: $failedValidator" -Output $validatorOutput
    exit 1
  }

  Write-Host "FAIL: Validators did not pass (Validator: $failedValidator), retrying..."
  Start-Sleep -Seconds 2  # Backoff zwischen Retries
  $elapsedSec += 2
}

Write-Host ""
Write-Host "FAIL: Max retries ($MaxRetries) exceeded without passing validation"
exit 1
