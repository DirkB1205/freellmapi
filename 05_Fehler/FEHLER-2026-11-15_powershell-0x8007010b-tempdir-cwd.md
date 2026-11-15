---
typ: fehler
titel: PowerShell startet nicht — 0x8007010b (Startverzeichnis nicht zugänglich) [Wiederholung]
datum: 2026-11-15T12:00:00
status: behoben
projekt: AI-System 3.0 Infrastruktur
fehlercode: "2147942667"
fehlercode_hex: "0x8007010b"
betroffene_komponente: opencode-Spawn via server.js (Inbox-Watcher)
root_cause: execFile in server.js:795 ohne cwd-Parameter → erbt Server-CWD (Temp-Dir) → gelöscht vor Spawn → 0x8007010b
tags: [powershell, fehler, infrastruktur, temp-dir, 0x8007010b, server.js, execFile]
verwandt: [[05_Fehler/FEHLER-2026-11_11_powershell-2147942667-tempdir.md]]
duplikat_von: FEHLER-2026-11_11_powershell-2147942667-tempdir.md
---

# PowerShell startet nicht — 0x8007010b (Startverzeichnis nicht zugänglich) [2026-11-15]

## Kurzfassung

Wiederholung des bekannten Fehlers [[05_Fehler/FEHLER-2026-11_11_powershell-2147942667-tempdir.md|FEHLER-2026-11_11_powershell-2147942667-tempdir]].
**Root Cause identifiziert**: `code/omni-dashboard/server.js:795` ruft `execFile` **ohne `cwd`-Option** auf → erbt CWD des Node-Servers. Wenn Server aus Temp-Verzeichnis gestartet wurde, wird dieses vor Spawn gelöscht → `0x8007010b`.

## Symptom

```
Fehler 2147942667 (0x8007010b) beim Start von %SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe
Startverzeichnis: C:\Users\DIRKBI~1\AppData\Local\Temp\tmpohvn1mm4 nicht zugänglich
```

## Diagnose (2026-11-15)

| Prüfschritt | Ergebnis |
|-------------|----------|
| `Test-Path "C:\Users\DirkBieler\AppData\Local\Temp\tmpohvn1mm4"` | **False** |
| `Get-ChildItem $env:TEMP -Directory -Filter "tmp*" \| Sort name` | 24 Einträge, keiner namens `tmpohvn1mm4` |
| Vergleich mit 2026-11-11 | Identisches Pattern (tmpXXX-Verzeichnis weg vor Spawn) |
| `grep -r "execFile.*cwd" code/omni-dashboard/` | **Fehlanzeige** — kein einziger execFile-Aufruf mit cwd |
| `server.js:795` Analyse | `execFile(cmdFile, cmdArgs, { env, timeout, windowsHide, maxBuffer }, ...)` — **cwd fehlt** |

## Lösung (permanent)

**Fix angewendet in `code/omni-dashboard/server.js:795`:**

```javascript
execFile(cmdFile, cmdArgs, { 
  env: env(), 
  timeout: 600000, 
  windowsHide: true, 
  maxBuffer: 1024 * 1024, 
  cwd: path.join(__dirname, '..')   // ← NEU: explizites Projekt-Root als CWD
}, (err) => { ... });
```

- `path.join(__dirname, '..')` = `E:\AI-System 3.0` (Projekt-Root)
- `path` ist bereits in Zeile 6 importiert: `const path = require('path');`
- Alle anderen Daemon-Scripts (`watch-inbox.ps1`, `start-dashboard.ps1`, `start-messengers.ps1`, `omni-daemon.js`) nutzen bereits korrekt Projekt-Root als CWD

## Verifikation

1. Server neu starten (`start-dashboard.ps1`)
2. Inbox-Eintrag erzeugen → Watcher triggert opencode-Spawn
3. opencode läuft mit CWD = Projekt-Root (nicht Temp)
4. Fehler 0x8007010b tritt nicht mehr auf

## Status-Historie

| Datum | Status | Notiz |
|-------|--------|-------|
| 2026-11-11 | resolved | Erstdiagnose (Symptom-Behandlung) |
| 2026-11-15 | behoben | Root Cause identifiziert & permanent gefixt (server.js cwd) |

