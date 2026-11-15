---
tags: [Recherche, ECC, Framework]
created: 2026-11-07
updated: 2026-11-07
---

# ECC-Framework Analyse: affaan-m/ECC

## Fragestellung

Welche Funktionalität bietet das ECC-Framework und eignet es sich als Betriebsschicht für AI-System 4.0?

## Quellen

- **GitHub:** `affaan-m/ECC` — 298K Sterne, MIT-Lizenz, aktiver Maintainer
- **Dokumentation:** `.opencode/README.md` im geklonten Repo
- **Installer:** `scripts/install-apply.js` mit `--target`, `--profile`, `--no-hooks` Flags
- **Build-Skript:** `scripts/build-opencode.js` — erzeugt `dist/index.js` Plugin

## Ergebnis

ECC bietet:
- **71 vordefinierte Agenten** mit spezialisierten Rollen (Planner, Architect, TDD-Guide, Code-Reviewer, Security-Reviewer, Performance-Optimizer, sprachspezifische Reviewer)
- **332 Skills** für wiederkehrende Aufgaben
- **104 Commands** für direkte Aufrufe
- **26 Agent-Prompt-Vorlagen** in `.opencode/prompts/agents/`
- **Native OpenCode-Unterstützung** über `.opencode/` Adapter
- **Hooks-System** für automatisierte Aktionen (optional, nur mit expliziter Zustimmung)

## Vertrauenswürdigkeit

- **Lizenz:** MIT — kommerzielle Nutzung erlaubt, keine Bedingungen
- **Aktivität:** Regelmäßige Updates, aktive Community
- **Sicherheit:** `install.sh` verwendet `--ignore-scripts`, keine festen Secrets im Code

## Offene Fragen

- Wie oft werden ECC-Updates veröffentlicht?
- Gibt es eine Version-Pinning-Möglichkeit für reproduzierbare Installationen?