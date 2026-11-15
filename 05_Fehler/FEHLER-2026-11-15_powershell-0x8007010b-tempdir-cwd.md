---
typ: fehler
titel: PowerShell startet nicht — 0x8007010b (Startverzeichnis nicht zugänglich) [Wiederholung]
datum: 2026-11-15T12:00:00
status: gelöst
projekt: AI-System 3.0 Infrastruktur
fehlercode: "2147942667"
fehlercode_hex: "0x8007010b"
betroffene_komponente: PowerShell.exe Start
root_cause: Temp-CWD vor Spawn gelöscht
tags: [powershell, fehler, infrastruktur, temp-dir, 0x8007010b]
verwandt: [[05_Fehler/FEHLER-2026-11_11_powershell-2147942667-tempdir.md]]
duplikat_von: FEHLER-2026-11_11_powershell-2147942667-tempdir.md
---

# PowerShell startet nicht — 0x8007010b (Startverzeichnis nicht zugänglich) [2026-11-15]

## Kurzfassung

Wiederholung des bekannten Fehlers [[05_Fehler/FEHLER-2026-11_11_powershell-2147942667-tempdir.md|FEHLER-2026-11_11_powershell-2147942667-tempdir]].
Pattern identisch: transienter Temp-CWD wird vor PowerShell-Spawn gelöscht → `0x8007010b`.

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

## Lösung

Siehe [[05_Fehler/FEHLER-2026-11_11_powershell-2147942667-tempdir.md|FEHLER-2026-11_11_powershell-2147942667-tempdir]]:
1. Betroffene Session neu starten.
2. Bei Wiederkehr: aufrufenden Prozess identifizieren (wer erzeugt `tmph*` mit festem Working-Dir?).
3. Optionale Prävention: `TEMP`/`TMP` auf langen Namen setzen (`C:\Users\DirkBieler\AppData\Local\Temp`) statt 8.3-Kürzel.

## Status-Historie

| Datum | Status | Notiz |
|-------|--------|-------|
| 2026-11-11 | resolved | Erstdiagnose |
| 2026-11-15 | gelöst | Wiederholung, gleiche Ursache |

