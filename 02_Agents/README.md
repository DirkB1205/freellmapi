---
tags: [agents, index, ecc]
created: 2026-11-06
status: aktiv
---

# Agenten – AI-System 4.0

Alle Agenten werden über **ECC** (affaan-m/ECC) bereitgestellt. Die 12 handgeschriebenen Definitionen wurden durch ECCs 71 Agents ersetzt.

## ECC-Agenten (71)

Die vollständige Liste befindet sich in `02_ECC/agents/`. Wichtige Agenten:

| Agent | Rolle |
|---|---|
| planner | Auftragsanalyse & Planung |
| architect | Architektur & Systemdesign |
| tdd-guide | Test-Driven Development |
| code-reviewer | Code-Review |
| security-reviewer | Sicherheitsprüfung (CVE-Check vor Import) |
| performance-optimizer | Performance-Optimierung |
| docs-writer | Dokumentation |
| test-architect | Testarchitektur |
| devops-engineer | DevOps & Deployment |
| database-architect | Datenbankarchitektur |
| api-designer | API-Design |
| security-auditor | Sicherheitsaudit |
| accessibility-reviewer | Barrierefreiheit |
| prompt-optimizer | Prompt-Optimierung |
| agent-architect | Agenten-Architektur |

## System-Agenten (neu)

| Agent | Rolle | Standort |
|---|---|---|
| Security-Agent | Prüft vor jedem Import externer Tools/Skills/Agents die neuesten CVEs | `02_Agents/Security-Agent.md` |
| Coding-Guideline-Agent | Überwacht, dass Code den aktuellen, präzisen und fehlerfreien Guidelines entspricht | `02_Agents/Coding-Guideline-Agent.md` |

## Nutzung

ECC-Agenten werden über OpenCode geladen. Die Konfiguration befindet sich im globalen OpenCode-Config-Verzeichnis:

`C:\Users\DirkBieler\.config\opencode\agents/`