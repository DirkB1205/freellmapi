---
tags: [ADR, Telegram, Integration]
created: 2026-11-07
status: accepted
---

# ADR-2026-11-07 — Telegram-Bot @dirkb_bot Integration

## Kontext

Der Telegram-Bot `@dirkb_bot` muss in die AI-System 4.0 integriert werden, um Anweisungen, Bilder, Videos und Sprachnachrichten empfangen und verarbeiten zu können.

## Alternativen

1. **Manuelle Integration:** Eigene Telegram-Bot-Logik schreiben – hoher Wartungsaufwand.
2. **Drittanbieter-Service:** Abhängigkeit von externem Service, Datenschutzbedenken.
3. **ECC-Telegram-Skill:** Bereits in `03_Skills/Telegram_ProcessSkill.md` definiert, nutzt offizielle Telegram-Bot-API.

## Entscheidung

Integration über den in `08_Workflows/Telegram_Integration.md` definierten Workflow. Der Bot-Token wird als `{env:TELEGRAM_BOT_TOKEN}`-Referenz in der OpenCode-Konfiguration gespeichert. Die Verarbeitung von Nachrichten folgt der Skill-Definition `03_Skills/Telegram_ProcessSkill.md`.

## Konsequenzen

- **Positiv:** Standardisierter Workflow, klare Trennung von Konfiguration und Logik, Security-Agent überwacht die Integration.
- **Negativ:** Erfordert die Einrichtung der Umgebungsvariable `TELEGRAM_BOT_TOKEN` und ggf. `TELEGRAM_WEBHOOK_URL`.

## Gegenmaßnahmen

Security-Agent prüft alle Telegram-bezogenen Konfigurationsänderungen. Regelmäßiger Scan auf auslaufende Tokens.