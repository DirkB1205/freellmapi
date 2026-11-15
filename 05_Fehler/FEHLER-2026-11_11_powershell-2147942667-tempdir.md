---
tags: [Fehler, Windows, Transient]
created: 2026-11-11
status: resolved
bereich: Windows / PowerShell
---

# Fehler 2147942667 (0x8007010b): PowerShell-Start, Startverzeichnis nicht zugreifbar

## Symptom
Fehler beim Start von `powershell.exe`:
> Startverzeichnis `C:\Users\DIRKBI~1\AppData\Local\Temp\tmph2y1ckgz` konnte nicht zugegriffen werden.

Fehlercode: `2147942667` / `0x8007010b` (STATUS_INVALID_IMAGE_FORMAT — hier irreführend, eigentliche Ursache: fehlendes/inaccessibles Working-Directory).

## Kontext
- 2026-11-11, Windows-Client `azuread\dirkbieler`
- `$env:TEMP` / `$env:TMP` = `C:\Users\DIRKBI~1\AppData\Local\Temp` (normal)
- Auslöser: Ein Tool (vermutlich OpenCode-Desktop oder ein Crashender Prozess) legte `tmph2y1ckgz` als Arbeitsverzeichnis an; das Verzeichnis wurde vor dem/zwischenzeitlich mit dem Elternprozess gelöscht oder freigegeben, bevor PowerShell den Start im Verzeichnis abschloss.

## Diagnose (2026-11-11)
1. `Test-Path C:\Users\DIRKBI~1\AppData\Local\Temp\tmph2y1ckgz` → **False** (Verzeichnis bereits weg).
2. `powershell -NoProfile -Command "Write-Host PS_OK"` → **PS_OK** (PowerShell startet wieder fehlerfrei).
3. Im Temp-Verzeichnis verbleibende Reste `.tmpXXXXXX`-Ordner anderer Tools (normal, werden von Windows nach Neustart/Idle aufgeräumt).

## Ursache
**Transienter Race:** Startverzeichnis existierte zum Aufrufzeitpunkt nicht mehr (Crash/Löschung des erzeugenden Prozesses). Kein Berechtigungsfehler, kein Systemfehler.

## Lösung
Keine nötig — selbstheilend. Falls der Fehler hartnäckig wiederkehrt:
1. Altes `tmph*`-Verzeichnis manuell löschen oder umbenennen.
2. Aufrufenden Prozess identifizieren (wer legt `tmph*` mit festem Working-Dir an?) und dessen Cleanup prüfen.
3. Temp-Pfad-Env-Variablen `TEMP`/`TMP` auf `C:\Users\DirkBieler\AppData\Local\Temp` (langer Name statt `DIRKBI~1`) setzen — 8.3-Kürzel sind ein zusätzlicher Bruchfaktor bei veralteten Handles.

## Status
`resolved` — 2026-11-11 verifiziert: PowerShell startet fehlerfrei, Temp-Verzeichnis ist aufgeräumt.
