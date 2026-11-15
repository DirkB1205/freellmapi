---
tags: [ADR, Sicherheit]
created: 2026-11-07
status: accepted
---

# ADR-2026-11-07 — Sicherheit: Keine Klartext-Secrets in Konfiguration

## Kontext

Sowohl globale als auch vault-lokale `opencode.json` enthielten Klartext-API-Schlüssel. Dies entspricht nicht den Sicherheitsanforderungen von AI-System 4.0.

## Alternativen

1. **Secret-Management-Service:** Komplex, erfordert zusätzliche Infrastruktur.
2. **Umgebungsvariablen mit `{env:...}`-Referenzen:** Einfach, von OpenCode native unterstützt, keine zusätzliche Infrastruktur.
3. **Verschlüsselte Config-Dateien:** Aufwendig, OpenCode-native Lösung bevorzugt.

## Entscheidung

Alle Secrets werden als `{env:...}`-Referenzen in den Konfigurationsdateien gespeichert. Die tatsächlichen Werte existieren nur als Umgebungsvariablen. Der Telegram-Bot-Token wird aus der `.env`-Datei im Projekt `social-automation` entfernt.

## Konsequenzen

- **Positiv:** Keine Klartexte in Dateien, einfach zu implementieren, OpenCode-native Unterstützung.
- **Negativ:** Secrets müssen als Umgebungsvariablen separat konfiguriert werden; bei Fehlen der Variablen funktioniert die Konfiguration nicht.

## Gegenmaßnahmen

Regelmäßiger Security-Scan (`code/scan_telegram.ps1`), Security-Agent überwacht alle Konfigurationsänderungen.