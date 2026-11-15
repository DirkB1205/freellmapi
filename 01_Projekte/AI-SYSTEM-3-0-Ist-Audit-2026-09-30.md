---
tags: [projekt, audit, ai-system-3-0, ist-stand]
erstellt: 2026-09-30
status: referenz
updated: 2026-11-06
bezug: "[[Projekte/AI-SYSTEM]]"
migrated_from: "AI-System 3.0 / Projekte/AI-SYSTEM-3-0-Ist-Audit-2026-09-30.md"
---

# Ist-Audit AI-SYSTEM (30.09.2026)

Anlass: Boss wollte ein neues Automations-Projekt in `E:\AI-System 3.0` bauen
(Telegram → Ollama → opencode → PR-Auto-merge). Vor dem Neubau wurde der
Ist-Stand gemessen — mit Live-Belegen, nicht aus dem Dossier.

## Projektstatus
- [x] Planung
- [x] Umsetzung
- [x] Test
- [x] Abgeschlossen

## A. Was bereits läuft (belegt)

| Baustein | Beleg |
|---|---|
| `node src/core.js` aktiv | PID 21736, Log `ai-system.log` zuletzt 30.09. 20:08 |
| Monitor-Dashboard | Port 8130 OPEN, `GET /api/jobs` liefert JSON |
| Ollama | Port 11434 OPEN, Route `@ollama` → `ollama/qwen3.5:2b` |
| OmniRoute | Port 20128 OPEN (`omniroute serve --port 20128`) |
| OpenJarvis | Port 11435 OPEN, Route `@jarvis` |
| Autostart | Tasks `ai-system-autostart` + `omni-watchdog` = Ready |
| Job-Historie | 39 `done`, 20 `failed`, 0 queued/running |
| Telegram | Long-Polling, `deleteWebhook`, User-ID-Allowlist (Sicherheit ok) |
| Medien-Download | photo/video/voice/audio/document → `data/mediaInbox` |
| Routing | `@name`-Präfix, 6 Routen, 1 Job pro Route, `maxConcurrent` |
| Zuverlässigkeit | Retry-Backoff + Jitter, Fehlerklassifikation, Lease-Recovery, `recoverRunning()` |
| Architektur | Node-built-ins, **null Dependencies** |

## B. Bestehende Fehler

1. **Medien sterben an der Queue-Grenze** (kritisch) →
   [[Fehler/FEHLER-2026-09-30_ai-system-medien-verloren-an-queue-grenze]]
2. **`questions.js` + `whatsapp.js` = Dead Code** — nirgends per `require()`
   geladen. Der ask-boss-Rückfragekanal läuft faktisch nicht.
3. **20 Failures.** Ursachenverteilung:
   - 10× Engine down / Port-Probe (OpenJarvis, OmniRoute)
   - 4× Telegram-Timeout
   - 3× Engine-Ausführung fehlgeschlagen
   - 3× Andere

## C. Empfehlungen (nicht ausgeführt)
- Dead Code `questions.js`/`whatsapp.js` entfernen oder integrieren.
- Medien-Queue-Grenze anheben.
- Engine-Health-Check pro Tick.
- Bestehendes `…\Default Project\AI-SYSTEM` erweitern (alle Testbelege
  [[Learnings/2026-09-29-Graphs-Meet-Agents-Patterns]]).

## Nächste Schritte
- Medien-Queue-Grenze beheben
- Dead Code bereinigen
- Engine-Health-Check implementieren