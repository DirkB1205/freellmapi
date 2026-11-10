---
tags: [Fehler, Orchestrator, Bridge]
created: 2026-11-08
updated: 2026-11-08
status: gelöst
---

# FEHLER-2026-11-08: Orchestrator-Bridge Intake-Fehler

## Symptom
- Orchestrator-Bridge nahm Inbox-Aufträge nicht auf
- Keine Tasks wurden erstellt
- Keine Telegram-Benachrichtigungen ausgelöst

## Kontext
- Bridge-Skript: `AI-SYSTEM/src/orchestrator.js`
- CLI-Aufruf: `python -m orch.cli intake "<text>" --source <source>`
- Working Directory: `code/orchestrator`
- Umgebung: Windows, OmniRoute + FreeLLMAPI

## Ursache
- `ORCH_INTAKE`-Flag wurde nicht korrekt ausgewertet
- Runtime-Check `isIntakeEnabled()` fehlte
- Whitelist für erlaubte Werte nicht implementiert: `undefined`, `''`, `'1'`, `'true'`
- Telegram-Spawn-Argumente falsch konstruiert

## Lösung
1. `isIntakeEnabled()` implementiert:
   ```javascript
   function isIntakeEnabled() {
     const val = process.env.ORCH_INTAKE;
     if (val === undefined || val === '' || val === '1' || val === 'true') return true;
     return false;
   }
   ```
2. Telegram-Spawn korrigiert:
   ```javascript
   spawn('powershell.exe', ['-ExecutionPolicy', 'Bypass', '-File', scriptPath, '-Text', text])
   ```
3. CLI-Selbstausführung getestet: `node AI-SYSTEM/src/orchestrator.js intake "bridge-test-4" --source=cli`

## Verifizierung
- E2E-Test bestanden: `bridge-test-4` in `code/orchestrator/data/tasks.db` persistiert
- Telegram-Benachrichtigung eingegangen
- Task-IDs: `t-c39f4f30ce`, `t-d33ba6076d`

## Status
- [x] Implementiert
- [x] Getestet
- [x] Dokumentiert (OMNI-INBOX.md, Index.md)

## Beleg
- OMNI-INBOX.md: Eintrag `- [x] **2026-11-08 10:30** [Orchestrator] Orchestrator-Bridge implementiert`
- Index.md: Link `[[05_Fehler/FEHLER-2026-11-08_orchestrator-bridge|Orchestrator-Bridge implementiert]]`
- Database: `code/orchestrator/data/tasks.db` enthält Test-Tasks
