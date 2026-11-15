---
aliases: [repo-hygiene, ai-system-repo-hygiene]
tags: [projekt, ai-system-3-0, git, hygiene]
created: 2026-10-11
status: offen
updated: 2026-11-06
related: "[[Projekte/AI-SYSTEM-MASTERPLAN-INDEX]]"
migrated_from: "AI-System 3.0 / Projekte/AI-SYSTEM-REPO-HYGIENE-2026-10-11.md"
---

# Repo-Hygiene-Befund (2026-10-11, Code-Repo `E:\AI-System 3.0\code`)

> Reiner **Befund** – es wurde **nichts committet**. Commit/Push nur auf Boss-Anweisung.

## Projektstatus
- [ ] Planung
- [ ] Umsetzung
- [ ] Test
- [ ] Abgeschlossen

## Projektziel

Saubere Git-Hygiene im Code-Repo: Secrets ausgeschlossen, Laufzeitdaten ignoriert, klare Commit-Regeln.

## Stand
- **29 geänderte, getrackte Dateien**, **26 untracked** Einträge (Ordner + Dateien).
- Keine getrackten Secret-Dateien (`git ls-files | grep secret|.key|token` → nur
  `design-system/bielernet.tokens.css`, harmlos).

## Niemals committen (Stand 2026-10-11)
- `AI-SYSTEM/data/cluster/` (secret.key + node-id) → **jetzt git-ignoriert**.
- `omni-dashboard/*.log`, `*.heartbeat`, `.inbox-watch-state.json`, `tunnel-url.txt`,
  `tunnel.log.err`, `*.pid` → Laufzeit.
- `omniroute-data/`, `graphify-out/`, `*.sqlite*`, `*.architecture.html`,
  `*.visual-check.*` → generierte Großdateien (OOM-Fehler 2026-09-30, siehe `.gitignore`).
- `AI-SYSTEM/config/routes.json.bak-jarvis-*` → Backup, jetzt via `*.bak-jarvis-*` ignoriert.
- `sessions/`, `task-db/` → Laufzeitdaten.

## Zu prüfen vor einem Commit (Vorschlag, noch nicht ausgeführt)
1. **Echte Quelländerungen** (gehören rein): `docs/DELTA-MASTERPLAN-3.0.md`,
   `docs/PHASE2-OPENWEBUI-MACHBARKEIT.md` (neu), `AI-SYSTEM/scripts/test-*.js` (neu),
   `AI-SYSTEM/scripts/launch-all.ps1`, `.gitignore`-Änderungen, `watch-inbox.ps1`,
   `skills/*/SKILL.md`.
2. **Laufzeit/Zustand** (nicht rein): all `omni-dashboard/*.json`, `*.log`,
   `.inbox-watch-state.json`, `chats.json`, `agent-engines.json` (prüfen!).
3. **Fremde/unfertige Ordner** (nicht rein, ohne Auftrag): `Excel-Aufmasse/`,
   `Makrotool/`, `freellm/`, `tool-forge/`, `AI-SYSTEM/deploy/` – erst zuordnen.
4. **Submodule-Nester**: `agency-agents-app`, `research-agent` erscheinen als
   geänderte Einträge → erst klären, ob Submodule oder Teil des Repos.

## Sauberes Commit-Rezept (wenn beauftragt)
```pwsh
git status --porcelain            # prüfen: KEIN data/cluster/, keine Secrets
git add <explizite Datei-Liste>   # allowlist, nie `git add -A`
git diff --cached --stat          # Gegencheck
git commit -m "<scope>: <was>"
```

## Nächste Schritte
- Repo-Hygiene verbessern (siehe Masterplan-Index Abschnitt 2)
- Offene Fragen: Submodule klären, fremde Ordner zuordnen