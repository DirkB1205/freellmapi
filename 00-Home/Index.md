---
aliases: [home, start]
tags: [MOC]
created: 2026-09-15
updated: 2026-11-08 (Index erweitert)
---

# Second Brain – AI-System 4.0

Mein persönliches Wissens-Archiv für OpenCode, Fehler, Learnings, Projekte, Agenten, Skills, Workflows und Wissensdaten.

## Architektur (4.0)

- **Betriebsschicht:** ECC (`affaan-m/ECC`) — 71 Agents, 332 Skills, 104 Commands, integriert über OpenCode-Plugin
- **System-Agents:** Security-Agent (CVE-Check vor Importen), Coding-Guideline-Agent (Guideline-Compliance)
- **Anforderungen:** Immer Deutsch antworten, Anrede „Boss“, keine Klartext-Secrets
- **Telegram:** Bot `@dirkb_bot` — Instructions, Bilder, Videos, Voice via `08_Workflows/Telegram_Integration.md`

## Navigations-Links

### Dashboard
- [[00_Dashboard/Home|Dashboard – Überblick & Quick-Reference]]
- [[00_Dashboard/Guidelines|Guidelines – Regeln & Sicherheit]]

### Agenten (ECC + System)
- [[02_Agents/README|Agenten-Index – 71 ECC Agents + 2 System-Agents]]
- [[02_Agents/Security-Agent|Security-Agent – CVE-Check vor Importen]]
- [[02_Agents/Coding-Guideline-Agent|Coding-Guideline-Agent – Guideline-Compliance]]

### Projekte (migriert aus AI-System 3.0)
- [[01_Projekte/|Projekte – 14 migrierte Dossiers]]
- [[Projekte/STATUS-AKTUELL-2026-11-07|Status: Aktueller Arbeitsstand (Memory)]]

### Fehler & Learnings
- [[05_Fehler/|Fehlerprotokolle]]
- [[05_Fehler/SEC-REVIEW-2026-11-06_ECC-Import|Security-Review: ECC-Import]]
- [[05_Fehler/FEHLER-2026-11-07_multi-chat-fatale-fehler|Fehler: Fatale Multi-Chat-Fehler (Verbindung, Sprache, Kontext)]]
- [[04_Learnings/|Learnings – Bewährte Lösungen]]
- [[04_Learnings/CodeGuardianAudit/CodeGuardianAudit-2026-11-08|Code Guardian Audit 2026-11-08 – 22/22 SUCCESS]]
- [[04_Learnings/LEARNING-2026-11-09_ruflo-Bewertung|Bewertung: ruvnet/ruflo – Agent-Harness (Empfehlung: keine direkte Integration)]]
- [[05_Fehler/FEHLER-2026-11-08_orchestrator-bridge|Orchestrator-Bridge implementiert]]
- [[05_Fehler/FEHLER-2026-11_09_econnreset-socket-reset|Fehler: ECONNRESET – Socket-Verbindung geschlossen (Retry „Versuch 10“)]]
- [[05_Fehler/FEHLER-2026-11_09_opencode-credentials-cooling-down|Fehler: OpenCode – „All credentials for model auto are cooling down“ (Retry „Versuch 3“ in 66 s)]]
- [[Projekte/ORCHESTRATOR-DAEMON|Orchestrator-Daemon – Vollautomatische Task-Pipeline (Health-Check, Retry/Fallback, Eskalation)]]
- [[04_Learnings/SocialMediaAutomation/tiktok_monetization_concept|TikTok-Monetarisierungskonzept (Basis 19 Analyse-Beispiele)]]

### Wissen & Entscheidungen
- [[06_Entscheidungen/|Entscheidungs-Log]]
- [[07_Recherche/|Recherche – Quellen & Analysen]]
- [[10_Wissensdatenbank/|Wissensdatenbank – Fakten & Referenzen]]

### Workflows & Skills
- [[08_Workflows/|Workflows – Telegram & Automation]]
- [[03_Skills/|Skills – Telegram-Processing & Mehr]]

## Themen

- [[00_Dashboard/]] – Dashboard, Guidelines, Home
- [[01_Projekte/]] – Migrierte Projekte (14 Dossiers)
- [[02_Agents/]] – ECC Agents (71) + System-Agents (2)
- [[02_ECC/]] – ECC Framework (Quellcode, 4.701 Dateien)
- [[03_Skills/]] – Skill-Definitionen
- [[04_Learnings/]] – Bewährte Lösungen (inkl. CodeGuardianAudit, SocialMediaAutomation)
- [[05_Fehler/]] – Fehlerprotokolle & Security-Reviews
- [[06_Entscheidungen/]] – Entscheidungs-Log
- [[07_Recherche/]] – Recherche-Ergebnisse
- [[08_Workflows/]] – Workflow-Definitionen
- [[09_Prompts/]] – Prompt-Vorlagen
- [[10_Wissensdatenbank/]] – Wissensdatenbank

## ECC-Integration

- **Installiert:** `node scripts/install-apply.js --target opencode --profile full --no-hooks`
- **Globaler Config-Pfad:** `C:\Users\DirkBieler\.config\opencode\`
- **Agenten:** 9 Agenten-`.md`-Dateien in `agents/`
- **Commands:** 104 Commands in `commands/`
- **Skills:** 332 Skills in `skills/`
- **Plugin:** `dist/index.js`
- **Installations-Status:** `ecc-install-state.json` (842 Operationen, 0 Fehler)

## Letztes Update

2026-11-08 — Orchestrator-Daemon: Provider-Health-Check, Retry/Fallback, Eskalations-Logik und Vault-Persistenz implementiert. `py_compile` Smoke-Test erfolgreich. Projekt-Note `Projekte/ORCHESTRATOR-DAEMON.md` angelegt.
