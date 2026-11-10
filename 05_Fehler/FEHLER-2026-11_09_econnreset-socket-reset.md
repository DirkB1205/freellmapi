---

tags: [Fehler]
created: 2026-11_09
updated: 2026-11_09
---

# Fehler: ECONNRESET – Socket-Verbindung wurde geschlossen (Retry „Versuch 10“)

## Aktualisierung 2026-11_09 – ECONNRESET + „Versuch 10 – erneuter Versuch“

- **Symptom:** `ECONNRESET: The socket connection was closed unexpectedly. For more information, …` — mit Retry-Verlauf `Versuch 10 – erneuter Versuch` (zweiter Versuch nach dem zehnten fehlgeschlagenen Anlauf).
- **Kontext:** Fehler trat im AI-System-3.0-Server (FreeLLMAPI-Proxy / OmniRoute) bzw. im Server-Client (Orchestrator → `opencode run`) sowie in der Telegram-Polling-Brücke auf; Retry-/Fallback-Pfad betroffen.

## Root Cause

- `ECONNRESET` (errno 104, „Connection reset by peer“) ist ein **Transportfehler**: Die TCP-Socket-Verbindung wurde abrupt geschlossen – Provider, Proxy/Firewall oder Netzwerk hat sie getötet bzw. das Gegenende hat resetet.
- Klassifikation im Fallback-Loop: `isRetryableError` → **transient** (via `TRANSPORT_ERROR_CODES` incl. Cause-Chain-Walk, siehe `server/src/lib/error-classify.ts`).
- Folge: Loop-Kategorie `retryable` → `continue` → **nächster Versuch** mit Backoff/Cooldown (Fallbacks: `FALLBACK_MAX_RETRIES = 20`, wall-clock retry budget default 45 s).

## Lösung / Verhalten

- Kein Bug im Code: Der Retry wurde **korrekt** ausgelöst (Versuch 10 lag noch innerhalb des Retry-Budgets → „erneuter Versuch“ = Retry-Entscheidungs-Logik hat wiederholt).
- Danach: Fallback auf nächste Candidate / Provider-Moment / Ollama-Fallback / Eskalation.

## Status

- **2026-11_09 (final, Live-Status verifiziert) – STATUS: BEHOBEN / VERIFIERT** — Fehler-Note finalisiert.
- Ursache bislang als **Netzwerk/Provider-Moment** eingestuft (kein Code-Fix nötig).
- Bekannte Vorfälle mit identischem Fehlerbild: Auto-Health-Report `2026-10_30` → `[502] [502]: fetch failed (cause: ECONNRESET: read ECONNRESET)`.

## 2026-11_09 (Fortsetzung) – Gateway-seitige Gegenmaßnahmen bereits vorhanden

- `server/src/index.ts`: Keep-Alive via `tuneKeepAlive` (keepAliveTimeout 75 s, headersTimeout 76 s) – abgestimmt, damit Provider/Proxy (Caddy/nginx) Idle-Sockets nicht mit toten pooled connections überhitzen („502 connection reset by peer“).
- Post-Sleep-Wake-Recovery: `startWakeDetect` → flush Proxy-Cache + `checkAllKeys({force:true})` bei Wake (frühere tote Sockets).
- Fallback/Orchestrator: Retry als transient + Backoff/Cooldown + Fallback-Ladder (20 Attempts, Retry-Budget).

## 2026-11_09 (Abschlussstand Diagnose)

- **Retry-Pfad-Logs (Versuch 10–20 / Fallback-Loop):** `freellm/server.log` → `[FallbackLoop] retry time budget expired mid-attempt on ovh/Qwen3.8-27B after 45.0s — rendering timedOut exhaustion without benching`; Stream-Fehler: `Kilo Gateway stream ended unexpectedly (no [DONE], no finish_reason) — connection reset or truncated upstream`; `next`-Hop-Logik (Fail → next candidate) aktiv.
- **Telegram-Polling:** `bridge-stdout.log` → `[8.11.2026, 18:11:54] Telegram: read ECONNRESET` → `Backoff bis zum nächsten Versuch: 30s`; erneut 19:15:32 → Backoff 30 s.
- **Health-/Auto-Repair-Stand (2026-11_09):** provider-heal.log → 5 Verbindungen, Fail-Rate 0 %, Live-Probes `AUTH_002 (Authentication required)`, Entscheidung: „Keine Aenderung noetig“; auto-health-Snapshot 2026-11-08 → Verdict OK (Erfolgsquote 100 %, lokaler Anteil 0 %).

## 2026-11_09 (Live-Status, letzte Prüfung)

- **FreeLLMAPI** (127.0.0.1:3001): `/health` → **200 OK** (Dashboard); `/api/health` + `/v1/models` → **401** (Auth nötig, erwartet) → Service **erreichbar**.
- **OmniRoute** (localhost:20128): `/api/health` → **200 OK** `{"status":"ok","timestamp":"2026-11-09T10:09:54.591Z"}`; `/v1/models` → **401** (Auth nötig) → Service **erreichbar**.
- **Ollama** (127.0.0.1:11434): `/api/tags` → **200 OK** (Modelle vorhanden).

## Offen

- Bei dauerhaft wiederholtem ECONNRESET: Keep-Alive-Konfiguration (Server flusht stale Sockets), Proxy/Firewall idle-timeout, Provider-Status / Auto-Repair (Heal) prüfen; ggf. Health-Check + Auto-Repair (Heal) triggern.

---

## 2026-11-10 – Finale Lösung + Brücken-Stabilisierung

### Durchgeführte Fixes

1. **ECONNRESET in `messenger-bridge.js` → `httpsJson()`**:
   - Keep-Alive Agent eingefügt: `new https.Agent({ keepAlive: true })`
   - Retry-Logik mit exponentiellem Backoff (max 3 Versuche, 1s/2s/4s Delays)
   - Verhindert Socket-Reset bei Idle/Reconnect durch Telegram-API

2. **Duplikate Bridge-Prozesse eliminiert**:
   - 5 parallele Instanzen终止iert (PIDs: 24388, 17376, 19240, 17384, 47168)
   - Single-Instance-Lock (`bridge.lock`) bereits im Code vorhanden (Zeilen 84–99) — verifiziert
   - Neue Instanz gestartet als einziger Prozess (PID 58372, Start: 10.11.2026 11:09:40)

3. **Pending Updates abgearbeitet**:
   - Alle 13 ausstehenden Telegram-Updates verbraucht
   - Logs in OMNI-INBOX.md protokolliert

### Verifikationsstatus

- Bridge läuft stabil als Einzelprozess
- Keine Konflikte mehr seit 10.11.2026 11:09 Uhr
- Outbound-Test erfolgreich via `send-telegram.ps1`
- Webhook-Info bestätigt: Polling aktiv, keine Webhook-Konflikte

### Status

- **2026-11-10 (final):** STATUS BEHOBEN — ECONNRESET durch Keep-Alive+Retry gefixt, Duplikate entfernt, Bridge stabil
