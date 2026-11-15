# AGENTS.md — Projektregeln für AI-System 4.0 Codeguardian-Pipeline

## Grundsatz
**AI-System 4.0 ist ein eigenständiger autonomer Workflow.**
- **Normalfall (Doctest Exit 0)**: Auto-Merge, Review-Note nur zur Dokumentation.
- **Fehlerfall (Doctest Exit ≠ 0)**: Reviewer analysiert → Rat entscheidet.
- **Kein Commit ohne Dokumentation** (Auto-Merge-Log oder Review-Note im Vault).

Siehe auch: `08_Workflows/AI_System_4.0_Autonomer_Workflow.md`, `06_Entscheidungen/ADR-2026-11-15_AI-System-4.0-Autonomie-Level.md`.

## Ablauf (automatisch via Plugin)

1. **Builder-Agent** schreibt Code (oder du schreibst manuell).
2. **Session idle** → Plugin triggert `scripts/verify.py`.
3. **verify.py** läuft pytest Doctests → Exit-Code bestimmt Pfad:
   - **Exit 0**: Auto-Merge → Logeintrag in `codeguardian/auto-merges.log`, Review-Note optional (nur Dokumentation).
   - **Exit ≠ 0**: Reviewer-Agent analysiert Fehler → schreibt Obsidian-Note (`status: fehlgeschlagen`, `abweichungen` befüllt) → **Rat entscheidet** (Security + Coding-Guideline + OmniRoute-Health).
4. **Note** landet in `codeguardian/` mit YAML-Frontmatter + Dataview-kompatiblen Feldern.
5. **Dashboard** (`Code-Prüfungen Übersicht.md`) zeigt alle Prüfungen, Status, offene Abweichungen.
6. **Rat-Entscheidungen** werden in `codeguardian/rat-decisions/` dokumentiert.

## Agent-Rollen

| Agent | Modell | Aufgabe |
|-------|--------|---------|
| `builder` | OmniRoute (auto) | Code schreiben, Features implementieren |
| `reviewer` | `ollama/codellama:latest` (ENV `REVIEWER_MODEL`, Default) | Strenge Prüfung: Schritt-Kommentare, Doctests, Randfälle, Security, Style → Obsidian-Note |

**Wichtig**: Reviewer nutzt `ollama/codellama:latest` (lokal, schnell, kostenlos). Über `.env` (`REVIEWER_MODEL`) austauschbar. Builder nutzt OmniRoute. Modellwahl basiert auf Benchmark 2026-11-11: `qwen3.8:27b` zu langsam (Timeout 60s), `codellama:latest` (~36s, 299 Tokens) und `qwen3-vl:2b` (~41s, 2410 Tokens) funktionieren, aber beide halluzinieren bei Code-Review-Aufgaben — `codellama:latest` ausgewählt für Geschwindigkeit und Token-Effizienz.

## Obsidian-Note-Format (Reviewer-Output)

```yaml
---
typ: code-pruefung
projekt: <projekt-name>
datum: YYYY-MM-DDTHH:MM:SS
status: bestanden | fehlgeschlagen
abweichungen: <zahl>
durchlauf: <laufnummer>
dateien:
  - path/to/file1.py
  - path/to/file2.py
tags: [codeguardian, <projekt>, review]
---
```

Sections (Markdown):
- `# Prüfung <projekt> — <datum> — Lauf <n>`
- `## Ergebnis` — Kurzfazit
- `## Schritt-Abgleich` — Erwartete vs. tatsächliche Schritte (aus Code-Kommentaren)
- `## Input/Output` — Beispiel-Aufrufe & erwartete Ergebnisse
- `## verify.sh` — Kommando, Exit-Code, stdout/stderr (gekürzt)
- `## Verknüpfungen` — Links zu verwandten Notizen, Issues, ADRs

## Plugin-Verhalten (`.opencode/plugins/auto-review.js`)

- Lauscht auf `session.idle` Event.
- Prüft: Gab es Code-Änderungen seit letzter Prüfung? (Git-Diff gegen `HEAD` oder Timestamp-Datei).
- Falls ja: `scripts/verify.sh` ausführen → Reviewer-Agent dispatchen → Note in `codeguardian/` schreiben.
- Timestamp-Datei: `.codeguardian-last-run` (speichert letzten Prüfzeitpunkt).

## Dataview-Dashboard

Datei: `codeguardian/Code-Prüfungen Übersicht.md`
Zeigt: Tabelle aller Prüfungen, Filter nach Status/Projekt, offene Abweichungen, Trend.

## Verpflichtende Code-Qualität (für Builder & Reviewer)

1. **Jede öffentliche Funktion** hat Doctest mit mindestens 1 Happy-Path + 1 Edge-Case.
2. **Schritt-Kommentare** im Code (`# Schritt 1: ...`, `# Schritt 2: ...`) — Reviewer gleicht ab.
3. **Keine `any`-Types** (TypeScript) / **Typ-Hints** überall (Python).
4. **Keine Hardcoded Secrets** — Reviewer prüft via Regex.
5. **Fehlerbehandlung**: Jede externe IO hat Try/Except + Logging.

## Notfall-Override (nur mit Boss-Bestätigung)

```bash
# Skip Review für einen Commit (DOKUMENTIEREN!)
git commit --no-verify -m "HOTFIX: <grund> — REVIEW SKIPPED, NACHPRÜFUNG ERFORDERLICH"
```
Danach **sofort** manuelle Review-Note erstellen.

## Rat-Entscheidung (bei Fehler/Ausfall)

**Zusammensetzung**: Security-Agent + Coding-Guideline-Agent + OmniRoute-Health-Agent

**Analyse**:
- Fehlerursache (Root-Cause)
- Risikobewertung (Security, Stabilität, Datenverlust)
- Handlungsoptionen mit Vor-/Nachteilen

**Entscheidung**:
- a) Fortsetzung mit Modifikation
- b) Rollback zum letzten funktionierenden Stand
- c) Manueller Override durch Boss (Dokumentationspflicht in OMNI-INBOX.md)

**Dokumentation**: Jede Rat-Entscheidung wird in `codeguardian/rat-decisions/` als Markdown-Note mit YAML-Frontmatter abgelegt.

## Einstieg für neue Chats

1. `OMNI-INBOX.md` prüfen → offene Prüfungen?
2. Vault `codeguardian/` lesen → letzte Notes, offene Abweichungen.
3. `scripts/verify.sh` manuell laufen lassen → Status prüfen.
4. Weiterarbeiten.