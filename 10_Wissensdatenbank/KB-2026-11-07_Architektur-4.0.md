---
tags: [Wissen, Architektur]
created: 2026-11-07
updated: 2026-11-07
---

# KB-2026-11-07 — AI-System 4.0 Architektur

## Fakten

- **System:** AI-System 4.0, aufgebaut in Obsidian als Vault bei `E:\AI-System 3.0`
- **Betriebsschicht:** ECC (affaan-m/ECC) über OpenCode
- **Agenten:** 71 ECC-Agenten + 2 System-Agenten (Security, Coding-Guideline)
- **Skills:** 332 ECC-Skills + 1 Telegram-Skill
- **Commands:** 104 ECC-Commands
- **Vault-Struktur:** 11 Verzeichnisse (00_Dashboard bis 10_Wissensdatenbank)
- **Migration:** 14 Projekte aus AI-System 3.0, 2 Fehler, 1 State-Backup

## Architektur-Übersicht

```
┌─────────────────────────────────────────────────────────┐
│                    Obsidian Vault                        │
│               E:\AI-System 3.0                           │
├─────────────────────────────────────────────────────────┤
│  00_Dashboard    │ Home, Guidelines, Workflow-Status     │
│  01_Projekte     │ 14 migrierte Projekte                 │
│  02_Agents       │ ECC-Index + 2 System-Agenten          │
│  02_ECC          │ ECC-Quellcode (geclontes Repo)        │
│  03_Skills       │ Telegram-Skill + ECC-Skills           │
│  04_Learnings    │ Bewährte Lösungen                     │
│  05_Fehler       │ Fehler-Dokumentation + Security-Review│
│  06_Entscheidungen│ ADRs                                  │
│  07_Recherche    │ Quellenanalysen                       │
│  08_Workflows    │ Telegram-Integration, Workflows       │
│  09_Prompts      │ Prompt-Vorlagen                       │
│ 10_Wissensdatenbank│ Fakten, Referenzen, Konfiguration   │
├─────────────────────────────────────────────────────────┤
│  Projekte_Altlasten│ 9.696 nicht-migrierte Dateien         │
│  paperclip/        │ Externes Repo (nicht Teil des Systems) │
└─────────────────────────────────────────────────────────┘
```

## Abhängigkeiten

- **OpenCode:** Konfiguration über `opencode.json` (vault-lokal und global)
- **ECC:** Installiert über `scripts/install-apply.js --target opencode --profile full --no-hooks`
- **Obsidian:** MCP-Server definiert, aber derzeit nicht funktionsfähig (Workaround: Dateisystem-Tools)
- **Telegram:** Bot `@dirkb_bot`, Token als `{env:TELEGRAM_BOT_TOKEN}` konfiguriert

## Quellen

- `00_Dashboard/Home.md` — Aktuelle Übersicht
- `00_Dashboard/Guidelines.md` — Richtlinien
- `02_Agents/README.md` — Agenten-Index
- `opencode.json` — Konfiguration