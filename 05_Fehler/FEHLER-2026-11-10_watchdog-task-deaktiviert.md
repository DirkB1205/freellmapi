---
tags: [Fehler]
created: 2026-11-10 15:00
bereich: OmniRoute / Infrastruktur
updated: 2026-11-10
status: gelöst
---

# FEHLER-2026-11-10: omni-watchdog deaktiviert + Get-NetTCPConnection kaputt → endlose ECONNRESET-Retrys

## Symptom
- opencode meldete wiederholt `ECONNRESET: The socket connection was closed unexpectedly` mit Retry-Schleife ("Versuch 5 – erneuter Versuch").
- OmniRoute (Port 20128) antwortete nachhaltig nicht: `/api/health`, `/v1/models` → HTTP 000, obwohl Verbindungen ESTABLISHED.
- crash.log: `[HEALTHZ] event loop stalled 10.7s (rss=670 MB)` — Node-Event-Loop friert >10 s ein (Boot-Stall).

## Ursachen (zwei unabhängige, die zusammen wirken)
1. **Watchdog-Task war deaktiviert** (`omni-watchdog`, Status "Deaktiviert", letzter Log 2026-11-09 12:40). Vermutlich beim AI-SYSTEM-v4-Neubau abgeschaltet, weil Sektion 2 die LEGACY core.js starten wollte (Telegram-409-Gefahr). Damit fielen ALLE Selbstheilungen weg.
2. **`Get-NetTCPConnection` liefert auf dieser Maschine für ALLE Ports 0 Listener** (getestet 3001/20128/8123/11434; netstat zeigt ABHÖREN, Dienste erreichbar). Der Watchdog erklärte daraufhin gesunde Instanzen für tot, killte sie alle 5 Min ("Alte OmniRoute-Instanz beendet" auf lebenden PID) und jackte dauerhaft Neustarts.
3. Verschärfend: OmniRoute-Boot dauert bei Last/event-loop-stall >60 s; Start-Instanzen landen in "Port already in use"-Konflikten (mehrfacher Parallel-Boot).

## Lösungen (umgesetzt 2026-11-10 ~14:45–14:57)
- `omni-dashboard/watchdog.ps1`:
  - Sektion 2 umgebaut: bewacht jetzt **AI-SYSTEM v4** (`Projekte\ai-system-v4\index.mjs`); Legacy core.js wird NICHT mehr gestartet (Telegram-409-Vermeidung).
  - Neuer Helfer `Test-PortListening` (.NET TcpClient, 2 s Verbindungsversuch) ersetzt ALLE `Get-NetTCPConnection`-Port-Checks (OpenJarvis, opencode web, Control Board, FreeLLMAPI, OmniRoute, Ollama).
  - OmniRoute-Health: **Doppel-Probe** (2 × 20 s Timeout) statt Einzelprobe 8 s; Fallback auf `/api/health` (wenn `/healthz` nicht existiert); Neustart nur, wenn BEIDE Proben fehlschlagen. Verify-Sleep nach Neustart 12 s → 45 s.
- `omni-dashboard/start-omniroute.ps1`: Server-Output fließt nach `omniroute-data\start-omniroute.log` (vorher verschwanden Crashs im versteckten Fenster).
- Scheduled Task `omni-watchdog` **re-aktiviert** (Enable-ScheduledTask).
- Endtest 14:56:24: alle Dienste "ok", OmniRoute ohne Neustart, kein falscher Kill.

## Verifikation
- `curl /api/health` + `/v1/models` auf 20128 → HTTP 200.
- watchdog.log 14:56-Zeile: `OmniRoute ok (Port 20128 lauscht, /healthz 200)` nach Doppelprobe.
- Genau eine serve-Instanz (PID 12076) + Wrapper + 9router + server-ws — keine Dubletten.

## Nachtrag 15:15 (dritter Layer)
- Nach den Fixes von 14:45-14:57 wedgete/killte sich OmniRoute trotzdem wieder (ECONNRESET in den Chats blieb).
- Fund: **ZWEI Watchdog-Instanzen parallel** (PID 22592 seit 14:03:46, PID 30364 seit 14:04:37), beide mit 5-Min-Takt — Spawn-Herd ungeklärt (mutmaßlich mehrere manuelle schtasks-/run-Aufrufe mit langer Guiedzeit).
- Folge: Eine Instanz killte die frisch gebootete OmniRoute-Instanz der anderen → Kill-and-Restart-Spirale; frische Boots starben alle paar Minuten wieder (crash code 4294967295).
- Fix: beide Zombie-Watchdogs beendet (Stop-Process). Danach ein sauberer Boot: `/api/health` 200.
- **Endverifikation 15:13:** `POST /v1/chat/completions` mit `model=auto` → HTTP 200 mit Antwort. Der `omniroute/auto`-Router selbst ist unverdächtig — die Chat-Fehler waren reine Server-Unavailability.
- Boss-Hinweis: In den Chats einfach die letzte Anfrage erneut senden ("Antwort wiederholen"), die Retries treffen jetzt einen lebenden Router.

## Learnings
- "Port belegt / Verbindung steht" ≠ "Server antwortet" — Event-Loop-Stall erzeugt exakt ECONNRESET.
- Watchdog nie grundsätzlich deaktivieren, um einen Einzelkonflikt zu fixen — Sektion umbauen statt Task abschalten (sonst verlieren ALLE Dienste ihre Selbstheilung).
- Ein System-Cmdlet kann kaputt sein: bei verdächtigen Ergebnissen immer mit zweitem Werkzeug (netstat/TcpClient) gegenprüfen.
- Health-Doppelprobe + Fallback-Endpoint verhindert Kill mitten im langsamen Boot.
