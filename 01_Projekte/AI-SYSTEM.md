---
tags: [projekt, ai-system-3-0, telegram, core]
created: 2026-09-22
status: läuft
updated: 2026-11-06
related: "[[Fehler/FEHLER-2026-09-22_ai-system-opencode-run-haengt]]", "[[Learnings/LEARNING-2026-09-27_ai-system-3-0-kern-rebuild-und-telegram-ownership]]"
migrated_from: "AI-System 3.0 / Projekte/AI-SYSTEM.md"
---

# AI-SYSTEM – Portables Telegram-Agenten-System

> **REGEL 0 (höchste Priorität):** Nicht raten. Analysieren und recherchieren.
> Jede Ist-Aussage muss gemessen oder nachgeschlagen sein. Ein Baustein gilt erst
> als ✅, wenn er (a) existiert, (b) **läuft** und (c) **verifiziert** wurde.
> „Installiert" ≠ „läuft". Aus einem offenen Port folgt **nie**, welche Software ihn hält.
> Vollständig mit Belegen: [[Learnings/LEARNING-2026-09-27_regel-0-nicht-raten]]

## Projektstatus
- [x] Planung
- [x] Umsetzung
- [x] Test
- [ ] Abgeschlossen

## Projektziel

Einzelner kopierbarer Ordner, der einen Telegram-Bot, eine Datei-Job-Queue,
einen Orchestrator (opencode) und ein Monitoring bündelt – zero npm-Dependencies,
nur Node built-ins. Ordner auf anderen Rechner kopieren → läuft sofort.

## Hintergrund

AI-System 3.0 Kern: Telegram-gesteuerte Job-Queue mit Engine-Abstraktion
(OmniRoute, OpenJarvis, Ollama). Wird als portables System betrieben.

## Anforderungen

### Muss
- Telegram-Bot mit Long-Polling, reply_to_message, typing
- Atomare Job-Queue (tmp+rename)
- Engine-Port-Probe vor Job-Ausführung
- Monitor-HTTP-Dashboard auf Port 8130
- Autostart über Scheduled Task

### Soll
- Job-Recovery bei Prozess-Kill
- Engine-Warteschlange (Cache 5s, Wartezeit 600s)

### Kann
- Open WebUI Integration (Port 8080)
- TTS über Piper

## Verwendete Agenten
- Builder
- Tester
- SecurityAgent

## Verwendete Skills
- (pending)

## Technologien
- Ollama
- OpenCode
- Playwright
- n8n

## Aufgaben

### Offen
- [ ] Job-Recovery bei Prozess-Kill: `running`-Jobs beim Start zurücksetzen
- [ ] Masterplan `docs/DELTA-MASTERPLAN-3.0.md` hat veraltete Zeilen zur Telegram-Architektur (Abschnitt 1 Z45, Abschnitt 4 Z239)
- [ ] Offene Roadmap-Schritte 7/8 (n8n `:5678`, Open WebUI `:8080`)

### In Arbeit
- [x] Kern komplett neu gebaut, verifiziert
- [x] 22/22 Jobs `done`, 0 `failed`
- [x] Live-Telegram: `@dirkb_bot`, `/status`, `/chats`
- [x] Autostart-Test: beide Dienste gekillt, Task gestartet, nach ~90 s zurück

### Erledigt
- [x] `node --check` über alle `src/*.js` grün
- [x] Engine-Warte-Test: `91e0a924` → `WARTE-OK`, `adbdbb7b` → `SOFORT-OK`
- [x] `scripts/doctor.ps1` grün: Node v24.14.1, opencode, Ollama, OmniRoute, OpenJarvis

## Bekannte Risiken
- Alte `messenger-bridge.js` muss gestoppt werden (gleicher Bot-Token → 49-Konflikt)
- OmniRoute-Server (Port 20128) muss laufen, sonst 20128/3000 down → Runs hängen
- OpenJarvis: `Start-Process -WindowStyle Hidden` auf die venv-`.exe` (Port 11435, ~45 s bis ready). Nicht `Invoke-CimMethod` (Fortran-Fehler 200)

## Learnings
- [[Learnings/LEARNING-2026-09-27_regel-0-nicht-raten]]
- [[Learnings/LEARNING-2026-09-27_ai-system-3-0-kern-rebuild-und-telegram-ownership]]

## Fehler
- [[Fehler/FEHLER-2026-09-22_ai-system-opencode-run-haengt]]

## Nächste Schritte
- Job-Recovery-Logik implementieren
- Masterplan-Dokumente auf den neuesten Stand bringen
- Open WebUI Integration prüfen