- [x] Hybrid-Strategie mit Demo-/Live-Badges implementiert.
- [x] Content-Ideen-Generator pro Plattform (TikTok/Instagram/YouTube) rule-basiert ohne externe Trends.
- [x] datetime-Import in server.py ergänzt, Server läuft.
- [x] Alte Referenzen zu trend_store in server.py entfernt.
- [x] Badge-Logik und CSS für Demo/Live-Trennung im Dashboard integriert.
- [x] 2026-11-08 [Social-Dashboard] Playwright-Tests 7/7 grün + Coverage ≥80% – Bereich: code\social-media-automation – 20/20 grün, Coverage src.metrics 95% (store.py 100%, server.py 90%, adapter.py 96%). Root Cause: get_snapshots nutzte days als LIMIT (Row-Limit) statt Zeitraumfilter → days=1 lieferte exakt 1 Zeile. Fix: WHERE metric_date >= cutoff (heute − (days−1)) + where_parts-Liste + LIMIT 100.

- [x] 2026-11-08 12:00:00 [Option A] Configure @dirkb_bot
- [x] 2026-11-08 12:00:00 [Option B] Use local folder E:\AI-System 3.0\07_Recherche\Telegram-Medien – fertig, Medien sammeln
- [x] 2026-11-08 [Config] settings.json angelegt unter Projekte/Server/config/ – Token & allowedUserIds befüllt
- [x] Bot-Token von @BotFather besorgen und in settings.json (Secret Management) eintragen
- [x] allowedUserIds mit Boss' Telegram-User-ID befüllen
- [x] Polling-Server starten (node src/telegram.js) – Log "Telegram-Polling wiederhergestellt" geprüft
- [x] Testnachricht an @dirkb_bot senden, Empfang + Antwort verifizieren
- [x] TypeError core.js:84 (undefined.model) behoben: Konfig-Dateien nach config/ verschoben, Route-Fallback in core.js
- [x] omni-protection.md erstellt (Schutzmechanismen dokumentiert)

- [ ] 2026-11-08 [Telegram-Push] Testfrage für Telegram-Push
- [ ] 2026-11-08 [Sprachnachricht] Test-Sprachnachricht mit OGG/Opus per sendVoice
- [ ] 2026-11-08 [Status-Nachricht] Status-Nachricht senden nach Push
