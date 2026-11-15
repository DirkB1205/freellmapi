---
tags: [Learning, PowerShell, Windows, Debugging]
created: 2026-11-12
updated: 2026-11-12
project: ai-system-v4
---

# PowerShell Get-NetTCPConnection auf Windows unzuverlässig für lokale Ports

## Symptom
`Get-NetTCPConnection -LocalPort 8130 -State Listen` meldet "NICHT OFFEN", obwohl der Health-Endpoint auf `http://127.0.0.1:8130/health` mit 200 OK antwortet und der Service läuft (PID aktiv, Uptime > 9h).

## Ursache
`Get-NetTCPConnection` zeigt nur Verbindungen im **aktuellen Benutzerkontext / Session** an. Node.js-Services, die als Hintergrundprozess oder unter anderem Kontext laufen (z. B. via PM2, nssm, Task Scheduler), sind oft nicht sichtbar.

## Lösung / Workaround
Statt Port-Prüfung via PowerShell: **HTTP-Health-Check nutzen**.

```powershell
# Zuverlässig
try { $r = Invoke-WebRequest -Uri "http://127.0.0.1:8130/health" -UseBasicParsing -TimeoutSec 5; "OK: $($r.StatusCode)" } catch { "FAIL: $($_.Exception.Message)" }
```

## Betroffene Dienste
- AI-SYSTEM v4 (Port 8130)
- Alle Node.js/Python/Go-Services, die nicht im interaktiven User-Kontext laufen

## Referenz
- Health-Response: `{"status":"ok","service":"ai-system-v4","uptimeSec":32745,"telegram":"connected"}`
- Service läuft stabil seit 2026-11-10 (Legacy-Webhook, Duplikat-Poller, Alt-Watchdog bereinigt)