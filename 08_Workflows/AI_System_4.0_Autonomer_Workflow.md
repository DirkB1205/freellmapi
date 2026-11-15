---
tags: [Workflow, AI-System-4.0, Autonomie]
created: 2026-11-15
status: aktiv
---

# AI-System 4.0 – Autonomer Workflow

## Übersicht

Eigenständiger Workflow mit automatischer Task-Vervollständigung nach 4–5 Fragen. Fallback an Rat bei Ausfall/Anomalien.

## Ablauf

### Phase 1: Inbox-Check (automatisch)
1. OMNI-INBOX.md lesen
2. Eigene Einträge identifizieren (`- [in-progress]`)
3. Bereich deklarieren
4. Bei offenen Tasks: Weiterarbeit ohne neue Begrüßung

### Phase 2: Task-Exekution (autonom)
- Bis zu 4–5 Interaktionsfragen pro Task
- Dokumentation aller Schritte in Vault
- Doctests nach jedem Write → Verify

### Phase 3: Review-Logik

| Prüfergebnis | Aktion |
|--------------|--------|
| Doctest EXIT 0 | Auto-Merge, Review-Note nur zur Dokumentation |
| Doctest EXIT ≠ 0 | Reviewer analysiert → Rat entscheidet |
| Reviewer-Ausfall | Sofortiger Fallback an Rat |

### Phase 4: Rat-Entscheidung (bei Ausfall)
- **Zusammensetzung**: Security-Agent + Coding-Guideline-Agent + OmniRoute-Health-Agent
- **Analyse**: Fehlerursache, Risikobewertung, Handlungsoptionen
- **Entscheidung**: 
  - a) Fortsetzung mit Modifikation
  - b) Rollback zum letzten funktionierenden Stand
  - c) Manueller Override durch Boss (Dokumentationspflicht!)

### Phase 5: Dokumentation
- Review-Note in `codeguardian/` (YAML-Frontmatter)
- Auto-Merges loggen in `codeguardian/auto-merges.log`
- Rat-Entscheidungen in `codeguardian/rat-decisions/`

## Regeln

1. **Keine Secrets in Code** – Umgebungsvariablen oder Secret-Management.
2. **Doctest-Pflicht** – Jede öffentliche Funktion mindestens 1 Happy-Path + 1 Edge-Case.
3. **Rat immer konsultiert bei**: Exit ≠ 0, Agentenausfall, Security-Warnung.
4. **Override nur mit Boss-Bestätigung** – Protokollierung in OMNI-INBOX.md.

## Status
Aktiv seit: 2026-11-15
Letzte Änderung: 2026-11-15
