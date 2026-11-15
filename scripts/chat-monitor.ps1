# Chat-Monitoring für OpenCode Sessions
# Überwacht alle aktiven Chats bis 08:00 Uhr morgen

$OutputFile = "E:\AI-System 3.0\00_Dashboard\Chat-Statistik.md"
$SessionFiles = @(
    "E:\AI-System 3.0\_c-altlasten-backup-20261008\Default-Project-kopien\AI-SYSTEM\data\sessions.json",
    "E:\AI-System 3.0\Projekte\Server\data\sessions.json"
)

function Get-ChatStatus {
    param($SessionFile)
    
    if (!(Test-Path $SessionFile)) { return @() }
    
    $sessions = Get-Content $SessionFile -Raw | ConvertFrom-Json
    if ($sessions -is [array]) { $sessions } else { $sessions.GetEnumerator() | ForEach-Object { $_.Value } }
}

function Get-LastActivity {
    param($session)
    
    if ($session -is [hashtable]) { $s = $session } else { $s = $session }
    
    if ($s.lastActivity -is [int] -or $s.lastActivity -is [double]) {
        $dt = [DateTimeOffset]::FromUnixTimeMilliseconds([int64]$s.lastActivity).LocalDateTime
    } elseif ($s.updatedAt -is [string]) {
        $dt = [DateTime]::Parse($s.updatedAt, [System.Globalization.CultureInfo]::CurrentCulture)
    } else {
        $dt = $null
    }
    
    return $dt
}

$allChats = @()

foreach ($file in $SessionFiles) {
    if (!(Test-Path $file)) { continue }
    
    try {
        $sessions = Get-Content $file -Raw | ConvertFrom-Json
        $sessionsData = if ($sessions -is [array]) { $sessions } else { $sessions.GetEnumerator() | ForEach-Object { $_.Value } }
        
        foreach ($session in $sessionsData) {
            $lastActivity = Get-LastActivity -session $session
            if (-not $lastActivity) { continue }
            
            $isActive = ($lastActivity -gt (Get-Date).AddMinutes(-15))
            $inactiveMinutes = [Math]::Round(((Get-Date) - $lastActivity).TotalMinutes, 0)
            $status = if ($isActive) { "🟢 AKTIV" } else { "🟡 INAKTIV seit $inactiveMinutes min" }
            
            $allChats += [PSCustomObject]@{
                SessionID = $session.id ?? "-"
                Titel = $session.title ?? "-"
                Status = $status
                LetzteAktivitaet = $lastActivity
                Model = $session.model ?? "-"
            }
        }
    } catch {
        Write-Warning "Error reading $file: $_"
    }
}

# Statistik generieren
$now = Get-Date
$timestamp = $now.ToString("yyyy-MM-dd HH:mm:ss")
$ tomorrowAt8 = (Get-Date).Date.AddDays(1).AddHours(8)
$hoursUntil = [Math]::Round(($tomorrowAt8 - $now).TotalHours, 1)

$activeCount = ($allChats | Where-Object { $_.Status -like "*AKTIV*" }).Count
$inactiveCount = ($allChats | Where-Object { $_.Status -notlike "*AKTIV*" }).Count

$report = @"
# Chat-Statistik — Echtzeit-Überwachung

**Stand:** $timestamp  
**Ziel:** Alle Chats bis morgen 08:00 Uhr fertig  
**Deadline in:** $hoursUntil Stunden

## Zusammenfassung
| Gesamt | 🟢 Aktiv | 🟡 Inaktiv |
|--------|----------|------------|
| $($allChats.Count) | $activeCount | $inactiveCount |

## Alle Chats im Detail

| Session | Titel | Model | Status | Letzte Aktivität |
|---------|-------|-------|--------|------------------|
"@

foreach ($chat in $allChats) {
    $timeStr = if ($chat.LetzteAktivitaet) { $chat.LetzteAktivitaet.ToString("yyyy-MM-dd HH:mm") } else { "-" }
    $report += $("`n| ____ ") + $chat.SessionID + (__($chat.Titel).Substring(0, 30) -join __) + (" | ") + $chat.Model + (" | ") + $chat.Status + (" | ") + $timeStr + "|`n"
}

$report += "`n`n---`n*Automatisch generiert durch chat-monitor.ps1*`n"

# Datei schreiben
$report | Out-File -FilePath $OutputFile -Encoding UTF8 -NoNewline

# Ausgabe
Write-Host "Monitoring aktualisiert: $activeCount aktiv, $inactiveCount inaktiv (von $($allChats.Count) gesamt)"
Write-Host "Bericht: $OutputFile"

# Als Tabelle ausgeben
if ($allChats.Count -gt 0) { $allChats | Format-Table -AutoSize }