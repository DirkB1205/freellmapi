---
tags: [Fehler]
created: 2026-11-11 09:12
bereich: OmniRoute / Infrastruktur
updated: 2026-11-11
status: behoben (transient), Root Cause: auto→klein-kontext-413
---

# FEHLER-2026-11-11: OmniRoute 413 context_too_large via omniroute/auto (Wiederholung)

## Symptom
- opencode meldet erneut: `[413]: The request is too large for every routed candidate … DreamPrompting API error 413: Request is too large (about 43,313 input tokens, limit 32,000).`
- Begleittext: „The compaction request cannot be reduced further without losing the latest exchange or checkpoint".

## Kontext
- Zeitfenster: 2026-11-11, ca. 06:32–07:23 Uhr (mehrere 413/502-Attempts hintereinander).
- Ursache: Auto-Combo (`omniroute/auto`) wählte einen Upstream-Candidate mit nur **32k Context** (DreamPrompting/Google/Gemini-3.1-Flash-Lite etc.), während der Request **~40.000–47.000 Tokens** umfasste.
- OpenCode-Default war auf `omniroute/ollama-local/qwen3.5:2b` (lokal, **262k Context**) gesetzt — die 32k-Candidates waren damit nicht mehr der Default, aber der Auto-Pool griff wieder ein.

## Lösung
1. OpenCode-Default auf `omniroute/ollama-local/qwen3.5:2b` (lokal, 262k Context) verankert (`C:\Users\DirkBieler\.config\opencode\opencode.json`).
2. v4 Auto-Handoff bei Kontextüberlauf + proaktiver Session-Reset (30 Nachrichten) implementiert; Combos `main-chain`, `dauerbetrieb` (aktiv), `static-best-free` gehärtet.
3. Verifikation 2026-11-11: `POST /v1/chat/completions` mit ~64k Tokens → **HTTP 200** (model=auto aufgelöst, lokales Backend); `model=ollama-local/qwen3.5:2b` → **HTTP 200**.

## Learnings
- 413 context_too_large ist **kein** Server-Crash, sondern Upstream-Context-Limit.
- Auto-Router kann transient auf kleine-Context-Candidates (32k) zurückfallen — auch wenn großer Context verfügbar wäre.
- Boss-Entscheid: lieber großkontextiges lokales Modell (`qwen3.5:2b`, 262k) als Auto mit kleinen Candidates.

## Offene Baustelle
- Bereits geöffnete, übergroße Chats einmal neu starten (Boss-Anweisung).
