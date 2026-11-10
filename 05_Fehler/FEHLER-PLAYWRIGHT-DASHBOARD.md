---
tags: [fehler, playwright, dashboard, browser-routing]
created: 2026-11-02
status: behoben
updated: 2026-11-06
related: "[[Projekte/AI-SYSTEM]]"
migrated_from: "AI-System 3.0 / Fehler/FEHLER-PLAYWRIGHT-DASHBOARD.md"
---

# Fehler: Kombiniertes Dashboard & Playwright / Browser-Routing

## Projektstatus
- [x] Ursache identifiziert
- [x] Fix implementiert
- [x] Verifiziert

## Datum
2026-11-02

## Ursache
Der Dashboard-Server in `Projekte/opencode-dashboard/server.mjs` lieferte statische Dateien nicht korrekt aus (z. B. `combined.html` mit falscher Länge/9 Bytes), weil nur bestimmte Routen hartkodiert waren.

## Fix
`server.mjs` anpassen, damit alle statischen Dateien im Verzeichnis korrekt mit den richtigen MIME-Types ausgeliefert werden.

## Auswirkung
- Statische Dateien werden nun korrekt ausgeliefert
- Browser-Routing über Playwright funktioniert zuverlässig

## Nächste Schritte
- Keine weiteren Maßnahmen nötig (behoben)