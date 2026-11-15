---
tags: [dashboard, home, uebersicht]
created: 2026-11-06
status: aktiv
---

# AI-System 4.0 – Dashboard

## Aktueller Stand: 2026-11-06

### Architektur

| Ebene | Standort | Beschreibung |
|---|---|---|
| Dashboard & Guidelines | `00_Dashboard/` | Home, Guidelines, Richtlinien |
| Agenten | `02_Agents/` | ECC-Agenten (71) + 2 System-Agenten |
| Skills | `03_Skills/` | ECC-Skills (332) + Projekt-spezifische |
| Learnings | `04_Learnings/` | Gelernte Muster & Erkenntnisse |
| Fehler | `05_Fehler/` | Fehleranalyse & Security-Reviews |
| Entscheidungen | `06_Entscheidungen/` | ADRs & architektonische Entscheidungen |
| Recherche | `07_Recherche/` | Research-Ergebnisse |
| Workflows | `08_Workflows/` | Telegram, CI/CD, Deploy |
| Prompts | `09_Prompts/` | Prompt-Vorlagen |
| Wissensdatenbank | `10_Wissensdatenbank/` | Wissensdatenbank |
| ECC Framework | `02_ECC/` | ECC Repo (affaan-m/ECC) als Betriebschicht |

## Offene Projekte

| Projekt | Status | Letzte Aktualisierung |
|---|---|---|
| [[01_Projekte/AI-SYSTEM]] | läuft | 2026-11-06 |
| [[01_Projekte/AI-SYSTEM-MASTERPLAN-INDEX]] | aktiv | 2026-11-06 |
| [[01_Projekte/AI-SYSTEM-CLUSTER-PHASE-B-C]] | abgeschlossen | 2026-11-06 |
| [[01_Projekte/AI-SYSTEM-CLIENT-VERSION-AUFTRAG]] | abgeschlossen | 2026-11-06 |
| [[01_Projekte/AI-SYSTEM-REPO-HYGIENE-2026-10-11]] | offen | 2026-11-06 |
| [[01_Projekte/AI-SYSTEM-3-0-Ist-Audit-2026-09-30]] | referenz | 2026-11-06 |
| [[01_Projekte/_STATUS-AUFTRAG-2026-10-28]] | laufend | 2026-11-06 |

## Letzte Fehler

| Fehler | Datum | Status |
|---|---|---|
| [[05_Fehler/FEHLER-PLAYWRIGHT-DASHBOARD]] | 2026-11-02 | behoben |
| [[05_Fehler/FEHLER-2026-10-27_watchdog-terminalfenster]] | 2026-10-27 | beobachtet |
| [[05_Fehler/SEC-REVIEW-2026-11-06_ECC-Import]] | 2026-11-06 | abgeschlossen |

## Neueste Learnings

| Learning | Datum |
|---|---|
| [[04_Learnings/LEARNING-2026-09-27_regel-0-nicht-raten]] | 2026-09-27 |
| [[04_Learnings/LEARNING-2026-09-27_ai-system-3-0-kern-rebuild-und-telegram-ownership]] | 2026-09-27 |

## Agenten

| Agent | Rolle | Status |
|---|---|---|
| ECC Planner | Auftragsanalyse & Planung | aktiv |
| ECC Architect | Architektur & Systemdesign | aktiv |
| ECC TDD Guide | Test-Driven Development | aktiv |
| ECC Code Reviewer | Code-Review | aktiv |
| ECC Security Reviewer | Sicherheitsprüfung | aktiv |
| ECC Performance Optimizer | Performance-Optimierung | aktiv |
| Security-Agent | CVE-Check vor Import (System) | aktiv |
| Coding-Guideline-Agent | Guideline-Überwachung (System) | aktiv |
| Telegram Bot (@dirkb_bot) | Telegram-Integration | konfiguriert |

## Workflows

| Workflow | Status | Beschreibung |
|---|---|---|
| Telegram Bot | konfiguriert | Text, Bilder, Videos, Voice-Nachrichten |
| ECC Install | abgeschlossen | 842 Operationen, 0 Fehler |
| Secret Management | aktiv | Alle Secrets über `{env:...}` |

## Schnellzugriff

- Guidelines: `00_Dashboard/Guidelines.md`
- ECC Index: `02_ECC/AGENTS.md`
- Telegram Workflow: `08_Workflows/Telegram_Integration.md`
- Security Review: `05_Fehler/SEC-REVIEW-2026-11-06_ECC-Import.md`