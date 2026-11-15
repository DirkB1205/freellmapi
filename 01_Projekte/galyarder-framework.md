---
tags: [projekt, dossier, galyarder, skills, framework]
created: 2026-10-30
status: aktiv
remote: https://github.com/galyarderlabs/galyarder-framework
branch: main
migrated_from: "AI-System 3.0 / Projekte/galyarder-framework.md"
---

# Dossier: Galyarder Framework

## Zweck

Open-Source-Framework, das Skills, Agents, Commands, Review-Gates und
Arbeitsprotokolle für AI-Coding-Agenten paketiert und installierbar macht
(npm-Paket `galyarder-framework`, CLI `galyarder`). Laut Repo-Beschreibung:
„Skills, commands, and integrations for AI coding agents."

## Ablage

- Lokal: `E:\AI-System 3.0\Projekte\galyarder-framework`
- Remote: https://github.com/galyarderlabs/galyarder-framework (Branch `main`, öffentlich)
- Klon: 2026-10-30, `git clone` (voller Verlauf), Repo-Version 1.8.1
- Pflichtdateien vorhanden: `AGENTS.md`, `README.md` (beide aus dem Repo)

## Struktur (Ist, gemessen)

| Pfad | Inhalt |
|---|---|
| `skills/` | Skill-Pakete (Kern des Frameworks) |
| `commands/` | Slash-Commands |
| `agents/` | Agent-Definitionen |
| `integrations/` | Anbindungen an Tools/Clients |
| `hooks/`, `scripts/`, `bin/` | Laufzeit, Scaffolding, CLI (`bin/galyarder.js`), Shell-Skripte |
| `docs/` | Doku inkl. `mkdocs.yml`, Departments-Baum |
| `tests/` | Smoke-/E2E-Tests (`scripts/smoke.sh`) |
| `.claude-plugin/`, `.codex/`, `.cursor/`, `.opencode/`, `.jules/` | Host-Adapter für die jeweiligen Agenten |
| `skills.json`, `package.json`, `CHANGELOG.md`, `ROADMAP.md` | Manifest, Version, Historie |

Wurzel-Konfiguration: `package.json` (v1.8.1), `mkdocs.yml`, `AGENTS.md`,
`CLAUDE.md`, `GEMINI.md`, `WORKFLOW.md`, `DESIGN.md`, `BRAND.md`.

## Windows-Einschränkung (behoben im Branch)

Der Upstream enthielt 278 Dateien mit `:` im Namen unter
`docs/departments/Knowledge/World-Map/` — auf NTFS ungültig, `git clone` bricht
ab. Lokaler Branch hat dies behoben.

## Nächste Schritte
- Abgleich mit AI-System 4.0 Skill-Struktur
- Selektive Übernahme der Skills, die nicht bereits vorhanden sind