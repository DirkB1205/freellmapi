# Chat-Monitoring Loop: alle 5 Minuten bis morgen 08:00 Uhr
# Startet im Hintergrund, schreibt 00_Dashboard/Chat-Statistik.md

$OutputFile = "E:\AI-System 3.0\00_Dashboard\Chat-Statistik.md"
$LogFile = "E:\AI-System 3.0\00_Dashboard\chat-monitor.log"
$EndTime = (Get-Date).Date.AddDays(1).AddHours(8)
$IntervalMinutes = 5

function Write-Log {
  param([string]$Msg)
  $ts = (Get-Date).ToString("HH:mm:ss")
  "[$ts] $Msg" | Out-File -FilePath $LogFile -Append -Encoding UTF8
}

function Get-OpenCodeSessions {
  # OpenCode speichert Session-Logs unter project/
  $sessionDir = "$env:USERPROFILE\.local\share\opencode\project"
  $results = @()

  if (!(Test-Path $sessionDir)) { return $results }

  # settings.json pro Session enthält Titel, Model, letzte Aktivität
  foreach ($dir in Get-ChildItem $sessionDir -Directory) {
    $settingsFile = Join-Path $dir.FullName "settings.json"
    if (!(Test-Path $settingsFile)) { continue }

    try {
      $settings = Get-Content $settingsFile -Raw | ConvertFrom-Json
      $model = if ($settings.model) { $settings.model } else { "-" }
      $title = if ($settings.title) { $settings.title } else { $dir.Name }
      $sessionId = $dir.Name

      # Letzte Dateiänderung im Session-Ordner als Aktivitätsmarker
      $latestFile = Get-ChildItem $dir.FullName -Recurse -File -ErrorAction SilentlyContinue |
        Sort-Object LastWriteTime -Descending | Select-Object -First 1

      if ($latestFile) {
        $lastActivity = $latestFile.LastWriteTime
      } else {
        $lastActivity = $dir.LastWriteTime
      }

      $isActive = ($lastActivity -gt (Get-Date).AddMinutes(-15))
      $inactiveMin = [Math]::Round(((Get-Date) - $lastActivity).TotalMinutes, 0)

      if ($isActive) {
        $status = "🟢 Aktiv"
      } else {
        $status = "🟡 Inaktiv seit ${inactiveMin} min"
      }

      $results += [PSCustomObject]@{
        SessionID = $sessionId
        Titel = $title
        Status = $status
        LetzteAktivitaet = $lastActivity
        Model = $model
        IsActive = $isActive
      }
    } catch {
      Write-Log "Fehler Session $($dir.Name): $_"
    }
  }

  return $results
}

Write-Log "=== Monitoring Loop gestartet ==="
Write-Log "Endzeit: $($EndTime.ToString('yyyy-MM-dd HH:mm'))"
Write-Log "Intervall: ${IntervalMinutes} min"

while ((Get-Date) -lt $EndTime) {
  $now = Get-Date
  $timestamp = $now.ToString("yyyy-MM-dd HH:mm:ss")
  $tomorrowAt8 = (Get-Date).Date.AddDays(1).AddHours(8)
  $hoursUntil = [Math]::Round(($tomorrowAt8 - $now).TotalHours, 1)

  $chats = Get-OpenCodeSessions
  $activeCount = ($chats | Where-Object { $_.IsActive }).Count
  $inactiveCount = ($chats | Where-Object { -not $_.IsActive }).Count

  $report = @"
# Chat-Statistik — Echtzeit-Überwachung

**Stand:** $timestamp
**Ziel:** Alle Chats bis morgen 08:00 Uhr fertig
**Deadline in:** ~$hoursUntil h
**Letzte Messung:** alle ${IntervalMinutes} min automatisch

## Zusammenfassung
| Gesamt | 🟢 Aktiv | 🟡 Inaktiv |
|--------|----------|------------|
| $($chats.Count) | $activeCount | $inactiveCount |

## Alle Chats im Detail

| Session | Titel | Model | Status | Letzte Aktivität |
|---------|-------|-------|--------|------------------|
"@

  foreach ($chat in $chats) {
    $timeStr = if ($chat.LetzteAktivitaet) { $chat.LetzteAktivitaet.ToString("HH:mm") } else { "-" }
    $titleShort = if ($chat.Titel.Length -gt 40) { $chat.Titel.Substring(0, 37) + "..." } else { $chat.Titel }
    $sessionShort = if ($chat.SessionID.Length -gt 20) { $chat.SessionID.Substring(0, 17) + "..." } else { $chat.SessionID }
    $report += "`n| $sessionShort | $titleShort | $($chat.Model) | $($chat.Status) | $timeStr |"
  }

  $report += @"

## Mess-Verlauf

Siehe Log: `chat-monitor.log`

---
*Automatisch generiert durch chat-monitor-loop.ps1 (alle ${IntervalMinutes} min)*
"@

  $report | Out-File -FilePath $OutputFile -Encoding UTF8 -NoNewline
  Write-Log "Messung: $activeCount aktiv, $inactiveCount inaktiv (von $($chats.Count) gesamt)"

  # Warte bis nächstes Intervall
  $next = (Get-Date).AddMinutes($IntervalMinutes)
  if ($next -lt $EndTime) {
    Start-Sleep -Seconds ($IntervalMinutes * 60)
  }
}

Write-Log "=== Monitoring Loop beendet (08:00 Uhr erreicht) ==="
