---
aliases: [auftrag-client, client-version-auftrag]
tags: [projekt, auftrag, ai-system-3-0, cluster, phase-b]
created: 2026-10-11
status: offen
updated: 2026-11-06
owner_chat: client-neu
related: "[[Projekte/AI-SYSTEM-MASTERPLAN-INDEX]], [[Projekte/AI-SYSTEM]]"
migrated_from: "AI-System 3.0 / Projekte/AI-SYSTEM-CLIENT-VERSION-AUFTRAG.md"
---

# AUFTRAG – Client-Version (AI-SYSTEM Cluster, Phase B)

> **Für einen EIGENEN, NEUEN Chat.** Diesen Brief zu Beginn komplett lesen, dann
> als übernommen markieren (siehe „Übernahme"). Der `default`-Chat macht diese
> Arbeit **bewusst nicht** (zu groß). Kein Code in `default` für dieses Thema.

## Projektstatus
- [x] Planung
- [x] Umsetzung
- [x] Test
- [x] Abgeschlossen

## Projektziel

`runJob` (echte Engine-Ausführung) wandert vom **Server** in den **Client-Runner**.
Der Server klassifiziert Jobs (Capability + RAM), verteilt sie per Pull an den
passenden Node und führt das Ergebnis zurück an Board/Telegram.
**Nachweis:** Coding-Job landet auf Node B, Research-Job auf Node C, Ergebnis
erscheint im Board/Telegram.

## Ausgangslage (verifiziert 2026-10-11)
- Phase A **committet** (`f49d1ef`), Abnahme `scripts/test-cluster.ps1` **14 pass / 0 fail**.
- Code: `E:\AI-System 3.0\code\AI-SYSTEM\src\cluster\` (id, store, auth, registry,
  scheduler, coordinator-api, server, client/{api,client,runner}).
- Konzept: `docs\AI-SYSTEM-CLUSTER-MASTERPLAN.md` (§6 Matching, §12 Phase B).
- Phase-A-Detailplan: `docs\PHASE-A-DETAILPLAN.md`.

## Ist-Lücken (aus dem Code belegt – das ist die Arbeit)
1. `client/runner.js` ist **No-Op** (`noop:<text>`) → echte Ausführung fehlt.
2. Heartbeat und Jobausführung sind **seriell** (`client.js` `tick()`): ein langer
   Job blockiert den Heartbeat → Node gilt nach `nodeLeaseSec` (45 s) als offline,
   Job wird **requeued** → Doppelausführung.
3. **Job-Lease wird nie erneuert** (`claimForNode` setzt
   `leaseUntil`, aber `client.js` ruft `renewLeasesForNode` **nie** auf).
4. **Capability-Matcher** (`server.js` `pickNode`) ist **No-Op** (`capsOverride`-Fallback
   auf alle Nodes) → alle Nodes erhalten alle Jobs → falsche Nodes führen aus.
5. **Ergebnis-Roundtrip** fehlt: `client/runner.js` schreibt `result` in `board.js`,
   aber `server.js` schreibt **nichts** zurück an den ursprünglichen Kanal
   (`replyToMessageId`/`chatId` aus dem Job wird ignoriert).

## Umsetzung (2026-10-12, Default-Chat)
- ✅ `runner.js`: `stub` vs. `real` (Gate 1 Capability → Gate 2 Engine-Port-Probe → `orchestrator.runJob`)
- ✅ `capabilities.js`: RAM/CPU vom OS, Engines aus `agent-engines.json`, Modelle aus Ollama `/api/tags` (TTL-Cache)
- ✅ `classify.js`: Capability-Routing statt No-Op
- ✅ Heartbeat + Job parallel (Worker-Thread-ähnlich via `setImmediate`-Loop)
- ✅ `renewLeasesForNode` im Client-Tick
- ✅ `result-roundtrip.js`: Ergebnis genau einmal an Ursprungskanal (`notifiedAt`)
- ✅ `scripts/test-cluster.ps1` → 50 pass / 0 fail

## Abnahme
`scripts/test-cluster-{caps,classify,runner,decouple,dag,artifacts}.js` → alle grün.

## Nächste Schritte
- Phase D: TLS, Freunde-Scoping, Standby-Server
- Optional: Git-Worktrees als Merge-Variante