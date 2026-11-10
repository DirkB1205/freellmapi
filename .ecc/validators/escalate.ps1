# Escalation bei Exhaustion (alle Retries aufgebraucht)
# Schreibt Vault-Fehler-Note und Inbox-Notify
param(
  [string]$TaskName,
  [string]$Phase,
  [string]$Reason,
  [string]$Output
)

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$vaultBase = "E:\AI-System 3.0"
$errorsDir = Join-Path $vaultBase "05_Fehler"

# 1. Vault-Fehlernote schreiben
$errorId = "escalation-{0:yyyyMMdd-HHmmss}" -f (Get-Date)
$errorFile = Join-Path $errorsDir "$errorId.md"

$frontmatter = @"
---
tags: [Fehler, Escalation]
created: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
status: open
bereich: Agenten-Architektur
phase: $Phase
---

# Escalation: $TaskName

## Kontext
- Task: $TaskName
- Phase: $Phase
- Zeit: $timestamp

## Ursache
$Reason

## Output
```
$Output
```

## Nächster Schritt
Manuelle Überprüfung erforderlich. Repo reparieren oder Task neu planen.
"@

Write-Host "[Escalate] Writing vault note: $errorFile"
New-Item -ItemType Directory -Force -Path $errorsDir | Out-Null
Set-Content -Path $errorFile -Value $frontmatter -Encoding UTF8

# 2. Inbox-Notify aktualisieren (append)
$inboxPath = Join-Path $vaultBase "OMNI-INBOX.md"
if (Test-Path $inboxPath) {
  $notifyLine = "- [ ] ESCALATED ${timestamp}: $TaskName ($Phase) → $errorsDir\$errorFile.md"
  Add-Content -Path $inboxPath -Value "`n## Aktuelle Eskalationen`n$notifyLine"
  Write-Host "[Escalate] Inbox updated: $notifyLine"
} else {
  Write-Host "[Escalate] WARN: OMNI-INBOX.md not found at $inboxPath"
}

Write-Host "[Escalate] Done - manual review required"
exit 0
