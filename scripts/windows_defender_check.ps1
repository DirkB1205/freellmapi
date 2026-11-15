$startDate = (Get-Date).AddDays(-3)
$filter = @{
    LogName = 'Microsoft-Windows-Windows Defender/Operational'
    StartTime = $startDate
}

Write-Host "=== Windows Defender Event Logs (letzte 3 Tage) ===" -ForegroundColor Cyan
Get-WinEvent -FilterHashtable $filter -ErrorAction SilentlyContinue |
    Where-Object { $_.Message -match 'opencode|omni|AI-System' } |
    Select-Object -Last 20 TimeCreated, Id, Message | Format-Table -AutoSize

Write-Host "`n=== MpThreatDetection (opencode|omni|AI-System) ===" -ForegroundColor Cyan
Get-MpThreatDetection | Where-Object { $_.ThreatName -match 'opencode|omni|AI-System' } |
    Select-Object -Last 20 ThreatName, ThreatCategory, DetectionType, DetectionTime | Format-Table -AutoSize

Write-Host "`n=== Alle Threat Detections (letzte 7 Tage) ===" -ForegroundColor Cyan
Get-MpThreatDetection | Where-Object { $_.DetectionTime -gt (Get-Date).AddDays(-7) } |
    Select-Object -First 20 ThreatName, ThreatCategory, DetectionType, DetectionTime, Resources | Format-Table -AutoSize