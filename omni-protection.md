# Omni-Protection

Dieses Dokument beschreibt die Schutzmechanismen des AI-Systems gegen Crashes und Instabilitäten.

## 1. Stream-Schutz (EPIPE)
- **Problem:** Bot stürzt ab, wenn `stdout` oder `stderr` geschlossen wird (z.B. durch Pipe-Tools).
- **Lösung:** Globaler Handler in `core.js` und `log.js`, der `process.stdout.on('error', ...)` abfängt und ignoriert (silent fail für Logs statt Crash).

## 2. Route-Validierung (TypeError)
- **Problem:** `core.js` stürzte ab, wenn eine Route nicht in `routes.json` gefunden wurde (`undefined.model`).
- **Lösung:** Strengere Fallback-Logik in `core.js`:
  ```javascript
  const routeDef = getRouteDef(msg.route) || { name: 'default', engine: 'opencode', model: '' };
  ```
  Dadurch wird immer ein valides Objekt zurückgegeben.

## 3. Telegram Resilienz
- **Problem:** Netzwerkfehler oder API-Timeouts beendeten das Long-Polling.
- **Lösung:**
  - `telegram.js` nutzt eine rekursive Polling-Schleife mit `try-catch`.
  - Bei Fehlern wird ein Backoff (5s) angewendet, bevor ein Reconnect versucht wird.
  - Automatischer `deleteWebhook` beim Start, um Polling-Konflikte zu vermeiden.

## 4. Berechtigungsschutz
- **Problem:** Unbefugte Nutzer könnten den Bot steuern.
- **Lösung:** `allowedUserIds` in `settings.json`. Alle Nachrichten von anderen IDs werden ignoriert (Log-Eintrag erfolgt).
