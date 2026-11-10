# Error-Parser für Eval-Gates
# Extrahiert strukturierte Fehlerinfos aus Validator-Output
# Usage: .ecc/validators/error-parser.ps1 -Output "<raw-output>" -Source "<tsc|eslint|npm-test>"
param(
  [string]$Output,
  [string]$Source = "generic"
)

if (-not $Output) {
  Write-Host '{"fatal":true,"errors":[],"summary":"no output captured"}'
  exit 0
}

$errors = @()
$failPattern = 'FAIL|Error:|error TS\d+|✖|×|\bat\b'
$lines = $Output -split "`n" | Where-Object { $_ -match $failPattern }

foreach ($line in $lines) {
  if ($Source -eq "tsc" -and $line -match '^(\S+)\((\d+),(\d+)\):\s*error\s+(TS\d+):\s*(.+)$') {
    $errors += @{ file = $Matches[1]; line = $Matches[2]; col = $Matches[3]; code = $Matches[4]; msg = $Matches[5].TrimEnd("`r"); type = 'type'; severity = 'error' }
  } elseif ($Source -eq "eslint" -and $line -match '^\s*\d+:\d+\s+(error|warning)\s+(.*)') {
    $errors += @{ msg = $Matches[2]; type = 'lint'; severity = $Matches[1] }
  } elseif ($line -match '(FAIL|fatal|failed|assert|expected|received)') {
    $errors += @{ raw = $line.Trim(); type = 'test'; severity = 'error' }
  }
}

$summary = switch ($errors.Count) {
  0 { "No parseable errors found in output" }
  1 { "One error detected" }
  default { "{0} errors/warnings detected" -f $errors.Count }
}

$result = @{
  source   = $Source
  count    = $errors.Count
  fatal    = $errors.Count -gt 0
  summary  = $summary
  errors   = $errors
} | ConvertTo-Json -Depth 3 -Compress

Write-Host $result
exit 0
