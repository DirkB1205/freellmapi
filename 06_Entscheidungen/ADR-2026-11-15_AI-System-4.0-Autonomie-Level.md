---
tags: [ADR, AI-System-4.0, Autonomie, Workflow]
created: 2026-11-15
status: accepted
---

# ADR-2026-11-15 — AI-System 4.0 Autonomie-Level mit Fallback-Rat

## Kontext

Das AI-System 4.0 soll als eigenständiger Workflow fungieren, der Aufgaben nach 4–5 Fragen automatisch abschließt. Aktuell erzwingt das System zwingend Write → Verify → Review-Zyklen mit manueller Freigabe durch den Reviewer-Agenten. Diese Beschränkung wird für Normalbetrieb aufgehoben.

## Alternativen

1. **Volle Autonomie**: System entscheidet eigenständig, kein menschliches Eingreifen bis auf Fehlerfälle.
2. **Hybrid-Modus (aktuell gewählt)**: Standardisierte Zyklen bei Fehlern + automatische Review bei Erfolg.
3. **Manuelle Steuerung**: Jede Aktion erfordert Boss-Bestätigung.

## Entscheidung

**Hybrid-Modus mit Fallback-Rat:**
- **Normalfall**: Automatisierte Durchführung nach 4–5 Fragen.
- **Bei Review-Pflicht**: Doctest-Erfolg → Auto-Merge, Doctest-Fehlschlag → Reviewer analysiert.
- **Bei Ausfall/Anomalie**: Rat (Multi-Agent-Review) trifft Entscheidungsgrundlage.
- **Rat-Prozess**: Bei Ausfall analysiert der Rat den Fehler und entscheidet über Fortsetzung, Rollback oder manuellen Override.

### Umsetzungsdetails

| Komponente | Verhalten |
|------------|-----------|
| **Doctest-Exit 0** | Auto-Merge, Review-Note optional (nur Dokumentation) |
| **Doctest-Exit ≠ 0** | Reviewer-Analyse + Ratsentscheidung |
| **Inbox-Check** | Automatisiert `- [in-progress]` Tasks übernehmen |
| **Fallback-Rat** | Zusammensetzung: Security-Agent + Coding-Guideline-Agent + OmniRoute-Health-Agent |

## Konsequenzen

- **Positiv**: Schnellere Task-Vervollständigung, weniger manuelle Schritte, autonome Workflows möglich.
- **Negativ**: Höhere Abhängigkeit von Agenten-Kohärenz, potenzielle Fehlerverschleppung wenn Review übersprungen wird.
- **Gegenmaßnahmen**: 
  - Automatische Protokollierung aller Auto-Merges in `codeguardian/auto-merges.log`.
  - Täglicher Audit-Scan durch Security-Agent.
  - Rat-Entscheidungen werden dokumentiert (`codeguardian/rat-decisions/`).

## Verknüpfungen

- AGENTS.md: Workflow-Definition
- OMNI-INBOX.md: Inbox-Integration
- 08_Workflows/AI_System_4.0_Autonomer_Workflow.md (neu)
