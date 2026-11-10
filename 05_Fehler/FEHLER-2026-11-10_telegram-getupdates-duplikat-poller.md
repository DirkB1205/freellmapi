---
tags: [Fehler]
created: 2026-11-10 15:55
bereich: Telegram / Infrastruktur
updated: 2026-11-10
status: gelöst (Ursache behoben)
---

# FEHLER-2026-11-10: Telegram getUpdates-409 nach Bridge-Restart – Duplikat-Poller

## Symptom
- Nach Messenger-Bridge-Neustart: `Telegram: getUpdates HTTP 409 {"ok":false,"error_code":409,"description":"Conflict: terminated by other getUpdates request; make sure that only one bot instance is running"}`
- Backoff waechsend: 30s → 60s → 60s; Polling lief dadurch endlos weiter, Telegram-Nachrichten wurden nicht mehr verarbeitet.

## Kontext
- Telegram Long-Polling erlaubt pro Bot-Token nur **eine** aktive getUpdates-Sitzung.
- Aktiver Telegram-Poller am 2026-11-10: **AI-SYSTEM v4** (`E:\AI-System 3.0\Projekte\ai-system-v4\index.mjs`, Port 8130, PID ~36976) – der offizielle Live-Kanal inkl. `/status`, `/help`, `/id`, `@route`.
- Messenger-Bridge (`code\omni-dashboard\messenger-bridge.js`) nutzt denselben Bot-Token; nach einem Neustart wurde sie wieder aktiv und pollte parallel → Telegram-409.

## Lösung
- Messenger-Bridge als getUpdates-Poller beendet.
- AI-SYSTEM v4 ist damit **Einzel-Poller** und Telegram wieder stabil (`telegram: enabled, running, lastError: ""`, `/api/status` OK).
- Bonus: Bot-Commands via `setMyCommands` registriert (`/start`, `/chats`, `/status`, `/reset`).

## Learnings
- Nach dem v4-Umbau darf die messenger-bridge.js **nicht** mehr als Telegram-Poller laufen (Watchdog-Sektion 2 entsprechend umgebaut; Legacy core.js bewusst nicht mehr bewacht).
- Telegram-409 war hier nicht Webhook, sondern reiner Poller-Duplikat-Konflikt.
- `/status` liegt in drei Stellen: AI-SYSTEM v4 (live), messenger-bridge.js (sekundaer), orch daemon (webhook). Live-Autoritaet: AI-SYSTEM v4.
