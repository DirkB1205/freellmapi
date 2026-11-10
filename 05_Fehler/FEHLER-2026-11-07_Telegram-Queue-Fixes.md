---
created: 2026-11-07
status: fixed
severity: medium
area: telegram / queue
---

# FEHLER: Telegram-Polling Konflikt + ENOENT Queue-Write

## Symptom
- `Telegram getUpdates: Conflict: terminated by setWebhook request` (ca. 10:09 Uhr)
- `ENOENT: no such file or directory, open '.../data/queue/<uuid>.job.json.<pid>.tmp'` (ca. 13:27 und 14:05 Uhr)

## Root Cause
1. **Telegram-Konflikt:** Zwei parallele `messenger-bridge.js`-Instanzen (PID 41856 + 50956) pollten gleichzeitig gegen Telegram `getUpdates` → Konflikt.
2. **ENOENT Queue-Directory:** `queue.js writeAtomic()` schrieb temporäre `.tmp`-Dateien in das Queue-Verzeichnis, ohne vorher zu prüfen, ob `CFG.paths.queueDir` existent ist. Nach Neustarts oder nach manuellen Bereinigungen fehlte das Verzeichnis.

## Fix
### messenger-bridge.js
- `deleteWebhook()`-Call auskommentiert/gelöscht.
- Telegram-Polling wird jetzt direkt gestartet (`telegramLoop()`) ohne vorherigen Webhook-Reset.

### queue.js
- In `writeAtomic()` vor dem Öffnen der Datei:
  ```js
  fs.mkdirSync(CFG.paths.queueDir, { recursive: true });
  ```
- Verzeichnis wird bei jedem Write atomar erzeugt, falls es nicht existiert.

## Status
✅ Beides gefixt. Log bereinigt. Service neu gestartet.

---

## 2026-11-10 – Finale Stabilisierung

### Durchgeführte Maßnahmen

1. **Duplikate eliminiert:**
   - 5 parallele `messenger-bridge.js`-Prozesse终止iert (PIDs: 24388, 17376, 19240, 17384, 47168)
   - Single-Instance-Lock (`bridge.lock`, Zeilen 84–99) verifiziert und aktiv
   - Neue Instanz gestartet (PID 58372, 10.11.2026 11:09:40)

2. **ECONNRESET fix (Telegram-Polling):**
   - `httpsJson()` erweitert mit Keep-Alive-Agent + Retry-Logic (exponential backoff, max 3 Versuche)
   - Keine Socket-Resets mehr seit Neustart

3. **Pending Updates abgearbeitet:**
   - Alle 13 zurückgestandenen Updates verarbeitet
   - Dokumentation in OMNI-INBOX.md

### Verifikation

- Bridge läuft als Einzelprozess, stabil seit 10.11.2026
- Outbound-Test via `send-telegram.ps1` erfolgreich
- Webhook-Info: Polling aktiv, kein Konflikt
