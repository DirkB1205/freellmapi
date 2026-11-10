---
tags: [Learning, Telegram]
created: 2026-11-10 15:58
bereich: Telegram / Infrastruktur
updated: 2026-11-10
---

# LEARNING-2026-11-10: Telegram – genau ein getUpdates-Poller pro Bot-Token

## Situation
Telegram Long-Polling erlaubt pro Bot-Token nur **eine** aktive getUpdates-Sitzung. Mehrere parallele Instanzen (z. B. AI-SYSTEM v4 + messenger-bridge.js mit demselben Token) führen zu dauerhaftem `409 Conflict: terminated by other getUpdates request`.

## Lösung
- Im Telegram-Stack genau **eine** Instanz als Poller aktiv halten.
- Nach Umbau (AI-System v4 als offiziellen Kanal) darf die messenger-bridge.js nicht mehr als Telegram-Poller starten; Watchdog-Sektion 2 entsprechend umgebaut.

## Warum funktioniert es
- Telegram verwaltet pro Bot eine Poller-Session; eine zweite Concurrent-Session wird vom Server gekilled → alle weiteren Poller erhalten 409 und Backoff-loopen.

## Wiederverwendung
- Vor jedem Telegram-Neustart: alle alten Instanzen killen, nur eine Poller-Instanz starten, auf `/api/status` (v4) oder Bridge-Log prüfen.
- Fehler-Detail: `05_Fehler/FEHLER-2026-11-10_telegram-getupdates-duplikat-poller.md`.
