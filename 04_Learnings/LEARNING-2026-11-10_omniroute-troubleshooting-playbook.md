---
tags: [Learning, Troubleshooting, OmniRoute, Infrastruktur]
created: 2026-11-10
updated: 2026-11-10
status: aktuell
---

# LEARNING-2026-11-10: OmniRoute / opencode Laufzeit-Diagnose & Troubleshooting-Playbook

> **Zweck:** Wenn OmniRoute/opencode wackelt, **hier zuerst lesen** — nicht das ganze System durchsuchen. Diese Note verdichtet die Erkenntnisse aus dem ECONNRESET-Tag (2026-11-10): 3 Fehler-Layer, 5 Root-Causes, alle Fixes.

## 1. Dienste & Ports (Quelle der Wahrheit)

| Dienst | Port | Health-Endpoint | Start-Skript | Status-Check |
|---|---|---|---|---|
| **OmniRoute** (Modell-Router, opencode-Backend) | 20128 | `GET /api/health` (200), `GET /v1/models` | `code/omni-dashboard/start-omniroute.ps1` | `curl /api/health` |
| FreeLLMAPI (Gateway, lm-studio-Modelle) | 3001 | `GET /health` (200, ohne Key), `GET /v1/models` (mit Key) | `code/freellm/start-freellm.ps1` | `curl /health` |
| Ollama (lokale Modelle) | 11434 | `GET /api/tags` (200, >0 Modelle) | `ollama serve` | `curl /api/tags` |
| Control Board (Dashboard) | 8123 | `GET /api/system` (200) | `code/omni-dashboard/server.js` | `curl /api/system` |
| OpenJarvis (@jarvis-Route) | 11435 | (Port lauscht) | `jarvis.exe serve` | Port-Check |
| AI-SYSTEM v4 (Telegram-Kanal) | 8130 | (HTTP) | `Projekte/ai-system-v4/index.mjs` | Prozess-Check |

**Datenverzeichnis OmniRoute (portabel):** `E:\AI-System 3.0\code\omniroute-data\`
**SQLite-DB:** `code/omniroute-data/storage.sqlite` (349 MB, integrity ok)
**Logs:** `code/omniroute-data/server/crash.log`, `code/omniroute-data/logs/application/app.log`, `code/omniroute-data/start-omniroute.log`
**OmniRoute-API-Key (Env):** `OMNIROUTE_API_KEY=sk-86315b787bf961ed-84ed0b-8efb6781` (nur als Env-Var, nie als Flag!)

## 2. Watchdogs — WER läuft, WER ist gefährlich

| Task / Skript | Intervall | Status | Gefahr |
|---|---|---|---|
| **`omni-watchdog`** (geprüft, gefixt) | 5 Min | **AKTIV** — einziger legitimer Guard | ok |
| `omni-eternal-watchdog` (Task) | bei Logon/Startup | **DEAKTIVIERT** — Task nicht deaktivierbar → Script + VBS durch No-Op (`exit 0`) ersetzt | war Kill-Spirale |
| `omni-guardian` (Task) | 2 Min | **DEAKTIVIERT** | war Babysitter des Eternal-Watchdogs, redundant |
| `omni-monitor` (Task) | 10 Min | **DEAKTIVIERT** | DB-Writes + Restart-Versuche alle 10 Min, verstärkte Kill-Spirale |
| `omni-provider-heal` | 30 Min | unverändert | ok |
| `omni-auto-health` | 60 Min | unverändert | ok |

**Regel:** Niemals einen Watchdog-Task "einfach deaktivieren", um einen Einzelkonflikt zu fixen — stattdessen die Sektion im Skript umbauen (sonst verlieren ALLE Dienste ihre Selbstheilung).

## 3. Bekannte Fallstricke (MUSS man wissen)

### 3.1 `Get-NetTCPConnection` ist auf dieser Maschine kaputt
Liefert für **alle** Ports 0 Listener zurück, obwohl netstat `ABHÖREN` zeigt und die Dienste erreichbar sind. Folge: Watchdogs erklären gesunde Dienste für tot und killen sie.

**Ersatz:** `Test-PortListening` (.NET `TcpClient`, 2 s Verbindungsversuch) — siehe `code/omni-dashboard/watchdog.ps1`.

### 3.2 OmniRoute-Boot dauert >60 s und blockiert den Event-Loop
- Boot-Stall `[HEALTHZ] event loop stalled 7-11s (rss=700 MB)` ist normal (heavy sync load).
- Health-Check während des Boots schlägt fehl → Watchdog killt die bootende Instanz → Kill-Spirale.
- **Fix:** Doppel-Probe (2× 20 s) + Fallback `/api/health` + Verify-Sleep 45 s (in watchdog.ps1 umgesetzt).

### 3.3 `omniroute/auto`-Cooldown
Fehler: `All credentials for model auto are cooling down` (reset_seconds ~80 s). Auslöser: kaputte/expired Provider-Verbindungen (antigravity, agy) im Auto-Pool. Fix: `is_active=0` für kaputte Verbindungen in `storage.sqlite` (`provider_connections`).

### 3.4 FreeLLMAPI (Port 3001) kann lautlos sterben
Nach dem Kill der Eternal-Watchdogs starb FreeLLMAPI und niemand startete es neu (Watchdog-Task war deaktiviert). Symptom: `lmstudio/auto` → 502 ECONNREFUSED 127.0.0.1:3001.
**Start:** `pwsh -File "E:\AI-System 3.0\code\freellm\start-freellm.ps1"`.

### 3.5 Zwei parallele Watchdog-Instanzen
Spawn-Herd (mutmaßlich mehrere manuelle `schtasks /run`-Aufrufe) → zwei Instanzen mit jeweils 5-Min-Takt killen sich gegenseitig die frisch gebooteten OmniRoute-Instanzen. Fix: alle Zombie-Prozesse killen, Task-Instanz-Policy prüfen.

### 3.6 STORAGE_ENCRYPTION_KEY-Mismatch
Provider `antigravity` und `agy` nicht entschlüsselbar (Key geändert). Re-Auth nötig, beeinträchtigt aber nichts (Verbindungen deaktiviert).

## 4. Diagnose-Schnellbefehle (in dieser Reihenfolge)

```powershell
# 1. Health aller Dienste
curl.exe -s -m 8 http://127.0.0.1:20128/api/health
curl.exe -s -m 8 http://127.0.0.1:3001/health
curl.exe -s -m 8 http://127.0.0.1:11434/api/tags

# 2. Chat-Endpunkt testen
$key = $env:OMNIROUTE_API_KEY
$body = '{"model":"auto","messages":[{"role":"user","content":"ok"}],"max_tokens":5}'
curl.exe -s -m 60 -X POST http://127.0.0.1:20128/v1/chat/completions -H "Authorization: Bearer $key" -H "Content-Type: application/json" -d $body

# 3. Prozesse prüfen
Get-CimInstance Win32_Process -Filter "Name='node.exe' OR Name='pwsh.exe'" | Where-Object { $_.CommandLine -match 'omniroute|freellm' } | Select-Object ProcessId,Name,CreationDate

# 4. Logs lesen
Get-Content "E:\AI-System 3.0\code\omniroute-data\server\crash.log" -Tail 15
Get-Content "E:\AI-System 3.0\code\omniroute-data\start-omniroute.log" -Tail 15
Get-Content "E:\AI-System 3.0\code\omni-dashboard\watchdog.log" -Tail 15

# 5. Provider-Status
$env:DATA_DIR='E:\AI-System 3.0\code\omniroute-data'; $env:OMNIROUTE_PORT='20128'
omniroute providers status --no-color
```

## 5. Reparatur-Ablauf bei ECONNRESET / "ständig weg und startet neu"

1. **Zombie-Watchdogs killen:** `Get-Process` auf `watchdog.ps1`/`eternal-watchdog.ps1` → `Stop-Process -Force`.
2. **OmniRoute sauber neu starten:** alle `node_modules\omniroute` + `start-omniroute.ps1` Prozesse killen → 3 s warten → `start-omniroute.ps1` starten → 90 s warten → `/api/health` prüfen.
3. **FreeLLMAPI prüfen:** `curl /health` auf 3001. Falls 000: `start-freellm.ps1` starten.
4. **Provider-Cooldown:** Falls `All credentials cooling down` → 2 Min warten oder Chat-Modell auf direktes Modell wechseln (`omniroute/lm-studio/FreeLLMAPI` oder `omniroute/ollama-local/qwen3.5:2b`).
5. **Kaputte Provider deaktivieren:** In `storage.sqlite` → `provider_connections` → `is_active=0` für expired/invalid Verbindungen.
6. **Watchdog re-aktivieren:** `schtasks /change /tn "omni-watchdog" /enable`.

## 6. Wichtige Dateipfade

| Was | Pfad |
|---|---|
| OmniRoute Start-Skript | `code/omni-dashboard/start-omniroute.ps1` |
| Watchdog (geprüft) | `code/omni-dashboard/watchdog.ps1` |
| Eternal-Watchdog (No-Op) | `code/omni-dashboard/eternal-watchdog.ps1` |
| Guardian (No-Op) | `code/omni-dashboard/guardian.ps1` |
| FreeLLMAPI Start | `code/freellm/start-freellm.ps1` |
| OmniRoute-Daten | `code/omniroute-data/` |
| SQLite-DB | `code/omniroute-data/storage.sqlite` |
| .env | `code/omniroute-data/.env` |
| crash.log (Server-eigen) | `code/omniroute-data/server/crash.log` |
| start-omniroute.log | `code/omniroute-data/start-omniroute.log` |
| watchdog.log | `code/omni-dashboard/watchdog.log` |
| eternal-watchdog.log | `code/omni-dashboard/eternal-watchdog.log` |
| omni-monitor.log | `code/omni-dashboard/omni-monitor.log` |
| AI-SYSTEM v4 | `Projekte/ai-system-v4/index.mjs` |
| opencode-Config | `C:\Users\DirkBieler\.config\opencode\opencode.json` |

## 7. Do-Not-List (nicht wiederholen!)

- **Niemals** `Get-NetTCPConnection` für Port-Checks verwenden → immer `Test-PortListening` (TcpClient).
- **Niemals** einen Watchdog-Task deaktivieren, um einen Einzelkonflikt zu fixen → Sektion umbauen.
- **Niemals** `omniroute` als CLI-Flag `--api-key` übergeben → nur über `OMNIROUTE_API_KEY` Env-Var.
- **Niemals** `omniroute serve` mit `Invoke-WebRequest` während des Boots prüfen → wartet mindestens 60 s.
- **Niemals** `storage.sqlite` ohne Backup verändern.

## Verknüpfungen
- Fehler-Notes: `05_Fehler/FEHLER-2026-11-10_omniroute-eventloop-stall-econnreset.md`, `05_Fehler/FEHLER-2026-11-10_watchdog-task-deaktiviert.md`
- Status-Log: `OMNI-INBOX.md` (Status-Log Sektion)
- Guidelines: `00_Dashboard/Guidelines.md` (Multi-Chat-Koordination, Memory-Persistenz, Health-Checks)
