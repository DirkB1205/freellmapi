---
tags: [projekt, ecc, analyse, skills, hooks, security]
created: 2026-09-20
status: offen
related: "[[00_Dashboard/Home]], [[03_Skills]]"
migrated_from: "AI-System 3.0 / Projekte/ECC-analyse.md"
---

# ECC – Agent-Harness-OS (Analyse)

## Was ist ECC

Monolithisches „Agent-Betriebssystem" (MIT, ~2.700 Commits, 261k Stars) für
Claude Code, Codex, OpenCode u.a. Kernphilosophie: „Optimize the context window.
Persist everything else." Pipeline: `plan → test → implement → review → verify →
remember → improve`.

## Umfang (laut README)

- 68 Agents, 292 Skills, 94 Kommandos, Hooks/Memory-Runtime, Regeln, AgentShield
- Quellen: `github.com/affaan-m/ECC`, npm `ecc-universal` / `ecc-agentshield`,
  Plugin `ecc@ecc`, Website ecc.tools

## Tiefenanalyse (2026-09-20)

### 1. Hooks-Runtime – Risiko gering–mittel

- Claude-Format: 9 PreToolUse, 2 PreCompact, Stop/SessionEnd etc.; Node-Bootstrap,
  blockt Path-Traversal; Windows → pwsh mit `-ExecutionPolicy Bypass`
- **Keine Exfiltration gefunden** – kein externer Netzwerk-Call in der Hook-Kette
- 2 moderate Schwachstellen: `desktop-notify.js:76` baut PowerShell-Zeile aus
  Assistant-Ausgabe (Prompt-Injection-Fläche); `permission.ask` auto-approved per
  Regex (opencode-Plugin)
- Konfigurierbar: `ECC_HOOK_PROFILE`, `ECC_DISABLED_HOOKS`, `ECC_DRY_RUN`

### 2. Security/AgentShield – solide statisch, kein Runtime-Schutz

- AgentShield-Quellcode NICHT im Repo (separates npm-Paket); 102 Regex-Regeln,
  kostenloser Scan lokal; nur `--opus` ruft Anthropic-API an
- Eigene Schwäche: empfiehlt selbst unpinned npx/Global-Install (Scanner-Finding)
- Redundant zu eigenem Setup: `security-review` ≈ omni-security
- Echter Mehrwert für Boss: `security-bounty-hunter` (Exploit-Triage),
  GateGuard-Fakten-Gate-Konzept, `the-security-guide.md` als
  Pflichtlesestoff

### 3. Skill-Set – sehr umfangreich, aber Redundanz

- 292 Skills, many overlap mit eigenem Skill-Pool (agent-reach, archify,
  debug-loop, etc.)
- Empfehlung: **nicht alle importieren**, nur die, die echten Mehrwert bringen
  oder Lücken schließen

## Fazit

ECC als Betriebsschicht nutzbar machen: Agenten-Definitionen übernehmen,
Skills selektiv integrieren, Hooks als Safety-Netz nutzen. Vollständige
Integration erfordert Security-Review vorher.

## Nächste Schritte
- [ ] Security-Review des ECC-Repo
- [ ] Clone des Repositories
- [ ] Selektive Skill-Übernahme
- [ ] Agent.mmd-Konfiguration für OpenCode