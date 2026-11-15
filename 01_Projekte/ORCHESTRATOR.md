---
tags: [projekt, orchestrator, agenten, ollama, dauerbetrieb]
created: 2026-11-02
status: aktiv
related: "[[00_Dashboard/Home]], [[00-Home/VORGABEN]], [[03_Skills]]"
migrated_from: "AI-System 3.0 / Projekte/ORCHESTRATOR.md"
---

# Dossier: Orchestrierung AI-System 3.0

## Zweck

Jede Eingabe – opencode oder Telegram – läuft durch **Promptmaster → Zerlegung →
Routing → Ausführung → Kontrolle → Abnahme**. Der Orchestrator teilt Aufgaben so
klein, dass auch `ollama-local` sie tragen kann, verhindert Doppelläufe und
verlangt für „fertig" einen Beleg.

## Wo es liegt

| Teil | Pfad |
|---|---|
| Engine + CLI | `code/orchestrator/orch/` |
| Registry (Provider, Agenten, Skills) | `code/orchestrator/registry.json` |
| Playbooks je Agent | `code/orchestrator/playbooks/` |
| Aufgaben-DB | `code/orchestrator/data/tasks.db` |
| Graph-DB | `code/orchestrator/data/graph.db` |
| Tests | `code/orchestrator/tests/` (11 Tests) |
| Agent | `~/.config/opencode/agents/orchestrator.md` |
| Skills | `~/.config/opencode/skills/{promptmaster,orchestrator}/` |
| Diagramm | `docs/orchestrator.workflow.{json,html}` |
| Telegram-Hook | `code/AI-SYSTEM/src/orchestrator.js` (`prepareTask`, fail-open) |
| Regel | `00-Home/VORGABEN.md` §11 |

## Ablauf in Kurzform

```powershell
cd "E:\AI-System 3.0\code\orchestrator"
$env:PYTHONPATH = "E:\AI-System 3.0\code\orchestrator"
python -m orch.cli intake "<eingabe>" --source opencode
python -m orch.cli next <task>
python -m orch.cli record <step> --status done --evidence "..."
python -m orch.cli gate <task> --tests pass --e2e pass --security pass
```

## Was real eingebunden ist

`council`, `debug-loop`, `graphify`, `obsidian-brain`, `agent-reach`,
`find-skills`, `security-review`, `omni-security`, `archify`, `humanizer`,
`omni-coordination`, Karpathy-Regeln (§9), Claude

## Nächste Schritte
- Orchestrator auf AI-System 4.0-Struktur anpassen
- Integration mit ECC als Betriebsschicht