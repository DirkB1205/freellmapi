---
aliases: [cluster-phase-b, cluster-phase-c, phase-b-c-dossier]
tags: [projekt, ai-system-3-0, cluster, phase-b, phase-c, dossier]
created: 2026-10-12
status: abgeschlossen
updated: 2026-11-06
related: "[[Projekte/AI-SYSTEM-MASTERPLAN-INDEX]], [[Projekte/AI-SYSTEM]], [[Projekte/AI-SYSTEM-CLIENT-VERSION-AUFTRAG]]"
migrated_from: "AI-System 3.0 / Projekte/AI-SYSTEM-CLUSTER-PHASE-B-C.md"
---

# AI-SYSTEM 3.0 – Cluster Phase B & C (Dossier)

> **Status:** Phase B **und** Phase C **umgesetzt & abgenommen** (2026-10-12, Default-Chat).
> Abnahme: `scripts/test-cluster.ps1` → **50 pass / 0 fail** (`node --check` grün).
> Masterplan: `docs/AI-SYSTEM-CLUSTER-MASTERPLAN.md` §12/§14/§15.

## Projektstatus
- [x] Planung
- [x] Umsetzung
- [x] Test
- [x] Abgeschlossen

## Projektziel

Echte Arbeitsverteilung (Phase B) und Projekt-Zusammenführung (Phase C) im AI-SYSTEM Cluster umsetzen.

## 1. Was erreicht wurde

**Phase B – Echte Arbeitsverteilung**
- Echter Client-Runner (`src/cluster/client/runner.js`): `stub` (`noop:<text>`) vs. `real`
  (Gate 1 Capability → Gate 2 Engine-Port-Probe → `orchestrator.runJob`).
- Echte Fähigkeiten je Knoten (`src/cluster/capabilities.js`): RAM/CPU vom OS, Engines aus
  `omni-dashboard/agent-engines.json`, Modelle aus Ollama `/api/tags` (TTL-Cache).
- Enqueue-Klassifikation (`src/cluster/classify.js` → `capability-router`).
- Heartbeat vom Job entkoppelt + Job-Lease-Erneuerung (`queue.renewLeasesForNode`).
- Ergebnis-Roundtrip (`src/board.js` + `src/cluster/result-roundtrip.js`): von Nodes erledigte
  Jobs **genau einmal** an den Ursprungskanal (`notifiedAt`).
- Capability-Routing über 2 Knoten (`capsOverride`, `handledBy`), Rollen-Schalter
  `scripts/cluster-role.ps1` (`server|client|status`, npm `cluster:*`).

**Phase C – Projekt, Artefakte, Review-Gate & UI**
- **C1** Projekt-DAG (`src/queue.js`): `project`/`stage`/`deps`/`gate` am Job; `depsState`
  (`ready`/`pending`/`blocked`), `depResults`, `claimable` nur bei `ready`,
  `reconcileDependents` (Kette blockiert nach Fehlschlag), `counts.blocked`.
- **C2** Artefakt-Store (`src/cluster/artifacts.js`, §15): content-addressed über `sha256`,
  Dedupe, `stat`/`list`/TTL-`prune`, Range; Routen `POST/GET /api/v1/artifacts` (+Range/ETag).
- **C3** Projekt + Review-Gate (`src/cluster/project.js`): Stage-Aggregation, `approve`/`reject`,
  **logisches Merge-Manifest** (Stages + Artefakt-Hashes). **Bewusst ohne Git-Worktrees**
  (windows-tauglich, kein Repo-Zwang) – Worktrees bleiben optional für Phase D.
- **C4** Cluster-Web-UI (`public/cluster.html`), vom Coordinator unter `/ui` ausgeliefert –
  **kein eigener Web-Port**; Nodes · Enqueue · Projekte/Freigaben · Jobs.
- **C5** Client-API (`src/cluster/client/api.js`): `artifactPut`/`artifactGet`; `/work` liefert `deps`.

## 2. Dateien (Repo `E:\AI-System 3.0\code`)

**Neu:** `src/cluster/capabilities.js`, `classify.js`, `artifacts.js`, `project.js`,
`result-roundtrip.js`, `src/board.js`, `public/cluster.html`, `scripts/cluster-role.ps1`,
`scripts/test-cluster-{caps,classify,runner,decouple,dag,artifacts}.js`,
`docs/PHASE-B-DETAILPLAN.md`, `docs/PHASE-C-DETAILPLAN.md`.

**Geändert:** `src/queue.js`, `src/config.js`, `src/core.js`, `src/notifier.js`,
`src/orchestrator.js`, `src/cluster/client/{client,api,runner}.js`,
`src/cluster/coordinator-api.js`, `config/node.example.json`, `.gitignore`, `package.json`,
`docs/AI-SYSTEM-CLUSTER-MASTERPLAN.md`, `docs/ai-system-cluster.workflow.{json,html}`,
`omni-dashboard/public/ai-system-cluster.workflow.html`.

## 3. Diagramm (Pflichtdarstellung)

Quelle `docs/ai-system-cluster.workflow.json` (Lanes: Admin & Kanäle · Server/Coordinator ·
Client-Knoten). Fluss A–C: Auftrag/Projekt → Klassifizieren → **Job-Store + DAG** →
Capability-Matcher → Pull → Runner-Gate → Lokale Engine → Ergebnis → **Review-Gate** →
Freigabe; Zweige **Artefakt-Store** und **Cluster-Web-UI**. archify **9/9**, showcase pass,
0 Fehler/0 Warnungen, **visual-check pass**. Spiegel SHA256 `ad5e55b…`:
`omni-dashboard/public/ai-system-cluster.workflow.html`.

## 4. Abnahmetests

| # | Test | Phase |
|---|---|---|
| T1–T9 | Coordinator/Enqueue/Lease/Fencing/Auth/Routing/Roundtrip | A/B |
| T3f | Projekt-DAG deps/blocked (Unit) | C1 |
| T3g | Artefakt-Store sha256/Dedupe/prune (Unit) | C2 |
| T10 | DAG E2E (Gate + Lauf nach Upstream) | C1 |
| T11 | Artefakt E2E (Upload/Download/Range/Auth) | C2 |
| T12 | Projekt-Freigabe + Merge-Manifest | C3 |
| T13 | Web-UI `/ui` → 200 | C4 |

T5 ✅ (Node über Tailscale) – 2026-10-15 abgenommen.

## 5. Nächste Schritte
- **Phase D** (Härtung/Komfort): TLS/revoke-bare Tokens, `protocolVersion`-Gate, Audit-Log,
  Freunde-Scoping, Cluster-Web-UI-Ausbau, Standby-Server, Storage-Backend austauschbar (MinIO/S3 hinter gleicher API).
- Optional: Git-Worktrees als Merge-Variante nachziehen.