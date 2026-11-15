---
tags: [fehler, windows, watchdog, powershell]
created: 2026-10-27
status: beobachtet
related: "[[Projekte/AI-SYSTEM]]"
---

# Watchdog öffnet kurz ein Terminalfenster

## Symptom

Ein leeres Terminalfenster öffnete sich regelmäßig etwa alle 30 bis 60 Sekunden und schloss sofort wieder. Der genaue Fenstertyp war zunächst nicht erkennbar.

## Kontext

Betroffene Umgebung: Windows, AI-System 3.0, Omni-Dashboard.

Der Task `omni-watchdog` läuft jede Minute und startet:

```text
pwsh.exe -NoProfile -NonInteractive -WindowStyle Hidden -File "E:\AI-System 3.0\code\omni-dashboard\watchdog.ps1"
```

Zusätzlich existiert der Logon-Task `ai-system-autostart`, der denselben Watchdog nach 45 Sekunden startet.

## Rechercheergebnis

Eine Prozessmessung über zwei Minuten zeigte wiederholt:

```text
pwsh.exe ... -WindowStyle Hidden -File ""E:\AI-System 3.0\code\omni-dashboard\watchdog.ps1""
conhost.exe ParentName=pwsh.exe
```

Der Watchdog war damit als unmittelbarer Verursacher bestätigt. Der erste unsichtbare VBScript-Wrapper enthielt zu viele Anführungszeichen und erzeugte deshalb weiterhin `conhost.exe`.

## Lösungsschritte

1. Datei angelegt:
   `E:\AI-System 3.0\code\omni-dashboard\watchdog-hidden.vbs`
2. Beide Tasks auf `wscript.exe` mit dem unsichtbaren Wrapper umgestellt:
   - `ai-system-autostart`
   - `omni-watchdog`
3. Wrapper korrigiert. Die funktionierende Zeile ist:

```vbscript
shell.Run """C:\Program Files\PowerShell\7\pwsh.exe"" -NoProfile -NonInteractive -WindowStyle Hidden -File ""E:\AI-System 3.0\code\omni-dashboard\watchdog.ps1""", 0, False
```

## Verifizierungstest

- `omni-watchdog` manuell gestartet.
- `LastTaskResult = 0`.
- Watchdog-Prozess läuft weiter.
- Nach dem korrigierten Start kein zugehöriges `conhost.exe` unter dem Watchdog-Prozess gefunden.
- Boss meldet aktuell: Noch kein weiteres Fenster erschienen.

## Aktueller Stand

Lösung ist unter Beobachtung. Falls das Fenster wieder erscheint, Prozessmessung mit Elternprozess und Kommandozeile fortsetzen. Nicht den Watchdog oder notwendige Dienste deaktivieren; nur den sichtbaren Startpfad korrigieren.
