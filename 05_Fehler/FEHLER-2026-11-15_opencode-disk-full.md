---
typ: fehler
projekt: opencode
datum: 2026-11-15T10:43:00
status: behoben
komponente: desktop-app
severity: hoch
---

# Error: "Es steht nicht genug Speicherplatz auf dem Datenträger zur Verfügung" — OpenCode Desktop App

**Datum:** 2026-11-15
**System:** Windows 11, Laufwerk C:

## Symptom

Die OpenCode Desktop App konnte nicht gestartet werden. Die Shell-Tool-Ausgabe schlug fehl mit:
```
failed to open output file C:\Users\DirkBieler\.local\share\opencode\shell\...\sh_*.out: Es steht nicht genug Speicherplatz auf dem Datenträger zur Verfügung. (os error 112)
```

Die App zeigte "server thrashing detected" im Renderer-Log und konnte keine Crashpad-Reports oder Logs mehr schreiben.

## Root Cause

Laufwerk C: war praktisch voll (0 Bytes frei). Die OpenCode Desktop App (Electron/Tauri) benötigt Speicherplatz für:
- Cache-Dateien
- Crashpad-Reports
- Shell-Ausgabe-Dateien
- Logs
- Update-Dateien (heruntergeladenes Update auf 2.3.0)

## Lösung

✅ **Fix angewendet:**
1. **Cache-Ordner** (`%APPDATA%\ai.opencode.desktop\Cache`) gelöscht (~30 MB)
2. **Crashpad-Reports** (`…\Crashpad\reports`) gelöscht
3. **Temporäre Dateien** in `%TEMP%` und `C:\Windows\Temp` gelöscht
4. **Papierkorb** geleert
5. **Speicherplatz freigegeben:** ~600 MB (von 0 Bytes auf 629.227.520 Bytes frei)

Die OpenCode-Prozesse laufen jetzt wieder und antworten (Responding: True).

## Verwandte Probleme

- **Update auf 2.3.0:** Die App hat ein Update auf Version 2.3.0 heruntergeladen und entpackt, aber noch nicht neu gestartet. Empfohlen: App neu starten, um das Update anzuwenden.
- **EPERM Snapshot-Fehler:** Separater Fehler — `FileSystem.rename` schlägt mit EPERM fehl bei Git-Storage im Snapshot-Verzeichnis. Kann ignoriert werden.

## Dateien

- `C:\Users\DirkBieler\AppData\Roaming\ai.opencode.desktop\` — App-Daten (Cache gelöscht)
- `C:\Users\DirkBieler\AppData\Local\@opencodedesktop-updater\pending\opencode-desktop-win-x64.exe` — Heruntergeladenes Update (2.3.0)
- `C:\Users\DirkBieler\.local\share\opencode\shell\` — Shell-Ausgabe-Dateien (konnten nicht geschrieben werden)

## Verifikations-Schritte

1. OpenCode Desktop App neu starten → sollte jetzt funktionieren
2. `/compact` in einer OpenCode-Session triggern → sollte jetzt erfolgreich sein
3. Optional: Speicherplatz auf C: weiter freigeben oder Daten auf E: verschieben (E: hat genug Platz)
