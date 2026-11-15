# CLAUDE.md — AI-System 4.0 Projektrichtlinien

Diese Datei wird bei jeder Session automatisch geladen. Alle Regeln gelten ohne Ausnahme.

---

## 0. OBERSTE REGELN (nicht verhandelbar)

1. **Immer auf Deutsch antworten.** Keine Ausnahme. Jede Antwort beginnt mit der Anrede `Boss,`. Englische Antworten sind ein fataler Fehler.
2. **Anrede: `Boss`** — Immer "Boss", nie "User", "Sir" oder "Du".
3. **Keine Klartexte für Secrets.** API-Keys, Benutzernamen, Passwörter nur über Umgebungsvariablen oder Secret-Management.
4. **Keine Begrüßung**, solange eine offene Aufgabe existiert. Wenn `OMNI-INBOX.md` einen offenen oder `- [in-progress]`-Eintrag enthält, wird diese fortgesetzt.
5. **Stets kostenlose Versionen / Open Source bevorzugen.** Kostenpflichtige Optionen nur nach ausdrücklicher Rücksprache mit dem Boss.

## 1. Multi-Chat-Koordination (PFLICHT vor jedem Task)

Vor JEDEM neuen Task:
1. `OMNI-INBOX.md` lesen – offene/`- [in-progress]`-Einträge identifizieren.
2. Eigene Arbeit als `- [in-progress]` markieren (mit Bereichs-Hinweis).
3. Vault konsultieren (`05_Fehler/`, `04_Learnings/`, `Projekte/`) — vorhandene Lösung wiederverwenden.
4. Bereichs-Deklaration im Antworttext.
5. Nach Fertigstellung: `- [x]` + Lösung notieren.

**Keine fremden Einträge löschen/umschreiben. Kein Auto-Launch fremder Tasks.**

## 2. Memory-Persistenz (PFLICHT)

- Nach jedem Teilschritt den Arbeitsstand in den Vault (`Projekte/`) persistieren.
- Bei Session-Start: zuerst Vault lesen (Index + offene Fehler + in-progress Inbox-Einträge) und Stand wiederherstellen, BEVOR geantwortet wird.
- Memory über `ck`/unified-memory nutzen, damit Kontext sessions-übergreifend erhalten bleibt.

## 3. Verbindung & Health (PFLICHT)

- Vor Nutzung eines Providers dessen Erreichbarkeit prüfen:
  - FreeLLMAPI: `http://127.0.0.1:3001/v1/models`
  - OmniRoute: `http://localhost:20128/v1/models`
  - Ollama: `http://127.0.0.1:11434/api/tags`
- Bei Verbindungsfehler: Retry (3 Versuche, Backoff), dann Fallback auf Ollama, dann Fehler an Boss melden — nie still hängenbleiben.
- Status in `OMNI-INBOX.md` / Vault dokumentieren.

## 4. Codeguardian-Pipeline (AI-System 4.0 Workflow)

**Grundsatz**: AI-System 4.0 ist ein eigenständiger autonomer Workflow.

- **Doctest Exit 0**: Auto-Merge, Review-Note nur zur Dokumentation.
- **Doctest Exit ≠ 0**: Reviewer analysiert → Rat entscheidet.
- **Kein Commit ohne Dokumentation** (Auto-Merge-Log oder Review-Note im Vault).

### Verpflichtende Code-Qualität

1. Jede öffentliche Funktion hat Doctest mit ≥ 1 Happy-Path + 1 Edge-Case.
2. Schritt-Kommentare im Code (`# Schritt 1: ...`) — Reviewer gleicht ab.
3. Keine `any`-Types (TypeScript) / Typ-Hints überall (Python).
4. Keine Hardcoded Secrets — Reviewer prüft via Regex.
5. Fehlerbehandlung: Jede externe IO hat Try/Except + Logging.

### Rat-Entscheidung (bei Fehler/Ausfall)

- **Zusammensetzung**: Security-Agent + Coding-Guideline-Agent + OmniRoute-Health-Agent
- **Dokumentation**: Jede Rat-Entscheidung wird in `codeguardian/rat-decisions/` als Markdown-Note abgelegt.

## 5. Fehler-Dokumentation

- Jeder fatale Fehler wird als Fehler-Note in `05_Fehler/` dokumentiert (Frontmatter + Symptom/Kontext/Lösung/Status).
- Index (`00-Home/Index.md`) nach Anlegen/Ändern aktualisieren.

## 6. Referenz-Dateien (detaillierte Quellen)

| Quelle | Pfad | Inhalt |
|--------|------|--------|
| Guidelines | `00_Dashboard/Guidelines.md` | Vollständige Richtlinien inkl. Quellen |
| Codeguardian | `AGENTS.md` | Pipeline, Agent-Rollen, Obsidian-Note-Format, Plugin-Verhalten |
| Inbox | `OMNI-INBOX.md` | Aktuelle Tasks, Status, offene Aufgaben |
| Vault | `Projekte/`, `05_Fehler/`, `04_Learnings/` | Wissensarchiv |
| Autonomer Workflow | `08_Workflows/AI_System_4.0_Autonomer_Workflow.md` | Vollständiger Workflow |
| ADR | `06_Entscheidungen/ADR-2026-11-15_AI-System-4.0-Autonomie-Level.md` | Autonomie-Level-Entscheidung |
