---
tags: [Wissen, ECC, Integration]
created: 2026-11-07
updated: 2026-11-07
---

# KB-2026-11-07 — ECC-Integration Details

## Fakten

- **Repo:** `affaan-m/ECC`, geklont nach `02_ECC/` (4.701 Dateien)
- **Lizenz:** MIT
- **Sterne:** 298K+
- **Installationsbefehl:** `node scripts/install-apply.js --target opencode --profile full --no-hooks`
- **Build-Befehl:** `npm install --ignore-scripts && node scripts/build-opencode.js`
- **Installierte Assets:** 9 Agenten-`.md`-Dateien, 104 Commands, 332 Skills, `dist/index.js` Plugin, `instructions/INSTRUCTIONS.md`
- **Installations-State:** `ecc-install-state.json` — 842 Operationen, alle `copy-file`, 0 Fehler

## Installierte Komponenten

| Komponente | Anzahl | Ort |
|---|---|---|
| Agenten | 71 | `02_ECC/agents/` + installiert |
| Skills | 332 | `02_ECC/skills/` + installiert |
| Commands | 104 | `02_ECC/commands/` + installiert |
| Plugins | 1 | `dist/index.js` |
| Prompt-Vorlagen | 26 | `.opencode/prompts/agents/` |

## Wichtige Dateien

- `02_ECC/.opencode/README.md` — Plugin-Architektur
- `02_ECC/scripts/install-apply.js` — Installer
- `02_ECC/scripts/build-opencode.js` — Build-Skript
- `02_ECC/agents/` — Agenten-Definitionen
- `02_ECC/skills/` — Skill-Definitionen

## Quellen

- `02_ECC/` — Geclontes Repo
- `C:\Users\DirkBieler\.config\opencode\ecc-install-state.json` — Installations-Log