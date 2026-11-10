---
tags: [Fehler]
created: 2026-11-10 14:50
bereich: OmniRoute / Infrastruktur
updated: 2026-11-10
status: gelöst (Workaround), Watchdog-Blindspot offen
---

# FEHLER-2026-11-10: OmniRoute Event-Loop-Stall → ECONNRESET-Retry-Schleife bei opencode

## Symptom
- opencode meldet wiederholt `ECONNRESET: The socket connection was closed unexpectedly` und startet Retry-Schleife ("Versuch 5 – erneuter Versuch").
- `curl http://127.0.0.1:20128/v1/models` → HTTP 000 (Verbindung scheitert), `curl /api/health` → HTTP 000.
- Gleichzeitig: netstat zeigt ESTABLISHED-Verbindungen auf Port 20128 (Port wirkt belegt).

## Kontext
- OmniRoute-Server-Prozess (node.exe `omniroute.mjs serve --port 20128`) lief, antwortete aber nicht mehr (Wedge).
- crash.log / app.log: `[HEALTHZ] event loop stalled 10.7s (rss=670 MB, heapUsed=286 MB, inflight=0)` — Event-Loop friert beim Start >10 s ein.
- Watchdog (`omni-watchdog`, Stufe 1) erkennt das NICHT: Port ist gebunden → "läuft". Er prüft nur Prozess/Port, nicht die Antwortfähigkeit.
- `reports\auto-health-latest.json` fehlte → Stufe 2 (provider-heal) hätte ohnehin nichts geraten.

## Lösung
1. Wedge-Prozess killen: `Stop-Process -Id <PID> -Force` (PID 19896 am 2026-11-10).
2. Neustart über das Start-Skript (hat Port-/Health-Guard):
   ```powershell
   $cmd='pwsh -NoProfile -WindowStyle Hidden -File "E:\AI-System 3.0\code\omni-dashboard\start-omniroute.ps1"'
   Invoke-CimMethod Win32_Process -MethodName Create -Arguments @{CommandLine=$cmd}
   ```
3. Verifizieren: `/api/health` 200, `/v1/models` 200, FreeLLMAPI (3001) und Ollama (11434) auch grün.

## Learnings
- "Port belegt / Verbindung steht" ≠ "Server antwortet". Event-Loop-Stall erzeugt exakt ECONNRESET-Symptome.
- Diagnose-Kette bei ECONNRESET: (1) curl √/api/health + /v1/models, (2) netstat-Zustände (Viele WARTEND/SCHLIESSEN_WARTEN = Flattern), (3) crash.log + app.log lesen.
- Watchdog-Blindspot: Stufe 1 müsste zusätzlich einen HTTP-Health-Check mit Timeout machen, nicht nur Port prüfen.

## Offene Baustelle
- Watchdog (`watchdog.ps1`) um Antwortfähigkeits-Check erweitern (curl /api/health mit Timeout), damit der Stall künftig selbst heilt.
- Beim Start zwei Credentials nicht entlüsselbar (`antigravity`, `agy`): STORAGE_ENCRYPTION_KEY fehlt/passwort geändert → Re-Auth nötig. Beeinträchtigt heute nichts, aber merken.
