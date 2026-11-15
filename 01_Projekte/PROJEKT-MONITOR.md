---
tags: [projekt, monitor, dashboard, abarbeitungsstand, live]
created: 2026-10-30
status: laeuft
pfad: E:\AI-System 3.0\Projekte\projekt-monitor
port: 4311
related: "[[Projekte/_STATUS-AUFTRAG-2026-10-28]], [[Fehler/FEHLER-2026-09-17_diagramm-live-daten-langsam]], [[Projekte/ECC-analyse]]"
migrated_from: "AI-System 3.0 / Projekte/PROJEKT-MONITOR.md"
---

# Dossier: projekt-monitor

## Anlass

Boss: „ich habe noch nicht eine einzige fertigstellung erhalten." Es gab
Statusdokumente mit dem Wort „fertig", aber keinen Nachweis, und keinen Ort, an
dem man den echten Stand aller Projekte auf einen Blick sieht.

## Was gebaut wurde

`E:\AI-System 3.0\Projekte\projekt-monitor` – ein read-only Board auf
<http://127.0.0.1:4311/>:

- **Abarbeitungsstand je Projekt** mit Beleg, nicht mit Prozentbalken.
- **Behauptung vs. Beleg** nebeneinander: was das Statusdokument sagt, und was
  Dateibestand und Session-Todos messen.
- **Live-Leiste**: welche Session in welchem Projekt arbeitet, mit Agent, Modell,
  letztem Tool und tickendem Alter.
- **Datei-Drilldown** je Projekt (bis 400 Dateien, neueste zuerst).

## Rat (5 Berater + Vorsitz) – Kern der Entscheidung

1. Ein Prozess, kein Zwei-Server-Aufbau.
2. Datenbank **direktlesen** (`node:sqlite`, read-only) statt `opencode serve`
   auf 4096 zu verlangen – der Server läuft dort messbar nicht.
3. Live-Signal aus `session_message` (während des Turns geschrieben);
   `part`/`message` sind erst am Turn-Ende da und als Live-Quelle untauglich.
4. Fertig ist **belegbasiert**, nie geschätzt.
5. Lesemodus v1: keine Freitext-Steuerung, keine Schreibaktionen.
6. Bindung hart auf `127.0.0.1`, SSE + Single-Flight-Cache.

## Nächste Schritte
- Projekt-Monitor auf aktuelle Struktur anpassen
- Integration mit AI-System 4.0 Dashboard