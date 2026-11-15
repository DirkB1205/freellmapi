---
tags: [Recherche, Obsidian, MCP]
created: 2026-11-07
updated: 2026-11-07
---

# Obsidian MCP Plugin: Funktionsumfang & Grenzen

## Fragestellung

Welche Funktionalität bietet das Obsidian MCP-Plugin und warum funktioniert es in dieser Umgebung nicht?

## Quellen

- **OpenCode-Konfiguration:** MCP-Server definiert mit `node E:\AI-System 3.0\02_ECC\scripts\mcp-obsidian.js`
- **Testläufe:** MCP-Tools geben leere Ergebnisse zurück
- **Dateisystem:** Vault ist über `write`/`read`/`shell` voll zugänglich

## Ergebnis

Das Obsidian MCP-Plugin ist in der Konfiguration definiert, aber die MCP-Tools liefern leere Ergebnisse. mögliche Ursachen:
- Plugin nicht installiert oder nicht aktiviert
- Falscher Pfad zur MCP-Script-Datei
- Obsidian-App nicht geöffnet
- Netzwerkverbindung zwischen OpenCode und Obsidian unterbrochen

## Vertrauenswürdigkeit

Die Konfiguration ist korrekt definiert, aber die Funktionalität ist nicht gegeben. Als Workaround werden die Dateisystem-Tools (`write`, `read`, `shell`) direkt genutzt.

## Offene Fragen

- Wird das Obsidian MCP-Plugin überhaupt installiert?
- Gibt es eine Alternative für den Dateizugriff über MCP?