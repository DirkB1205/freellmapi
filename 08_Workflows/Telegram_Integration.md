# Telegram Integration (Sichere Speicherung)

Um das `TELEGRAM_BOT_TOKEN` sicher außerhalb des Repositories zu speichern, nutzen wir unter Windows eine System-Umgebungsvariable.

## Einrichtung (Windows)

1. Öffne die PowerShell oder Eingabeaufforderung (CMD) als **Administrator**.
2. Setze die Variable dauerhaft im System:
   ```powershell
   [Environment]::SetEnvironmentVariable("TELEGRAM_BOT_TOKEN", "DEIN_TOKEN_HIER", "Machine")
   ```
   *Hinweis: Wenn dies nicht funktioniert, kann `setx /M TELEGRAM_BOT_TOKEN "DEIN_TOKEN_HIER"` verwendet werden.*

3. **Wichtig:** Starte danach alle Prozesse neu, die das Token benötigen (z.B. den Orchestrator oder das Dashboard), damit die Änderungen wirksam werden.

## Überprüfung

Prüfe in einer neuen PowerShell-Instanz:
```powershell
$env:TELEGRAM_BOT_TOKEN
```
Wenn das Token ausgegeben wird, ist die Konfiguration korrekt.

## Konfiguration in Dateien

Das Repository greift nun automatisch auf `TELEGRAM_BOT_TOKEN` aus der Systemumgebung zu. `.env`-Dateien im Projekt enthalten **kein** echtes Token mehr.
