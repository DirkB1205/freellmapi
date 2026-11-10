---
tags: [Learning, Sicherheit, Konfiguration]
created: 2026-11-07
updated: 2026-11-07
---

# Secret-Management: Keine Klartexte in Config

## Situation

Ursprünglich enthielten sowohl der globale als auch der vault-lokale `opencode.json` Klartext-API-Schlüssel (freellmapi, omniroute, Telegram). Dies war eine erhebliche Sicherheitslücke.

## Lösung

Alle Secrets wurden durch `{env:...}`-Referenzen ersetzt. Der Telegram-Bot-Token wurde aus der `.env`-Datei im Projekt `social-automation` entfernt und soll nur noch als Umgebungsvariable `TELEGRAM_BOT_TOKEN` konfiguriert werden.

## Warum funktioniert es

- **OpenCode Secret Management** unterstützt `{env:VARIABLE}`-Referenzen. Der tatsächliche Wert niemals in Konfigurationsdateien gespeichert.
- **Umweltvariablen** können separat verwaltet, rotiert und auf berechtigte Prozesse beschränkt werden.
- **Auditierbarkeit:** Jede Konfigurationsänderung zeigt immediately, wo ein Secret referenziert wird, ohne den tatsächlichen Wert preiszugeben.

## Wiederverwendung

Jede neue Konfigurationsdatei: niemals API-Schlüssel, Passwörter oder Tokens im Klartext schreiben. Immer `{env:...}`-Referenz verwenden. Wenn ein Secret nicht als Umgebungsvariable verfügbar ist, OpenCode Secret Management nutzen.