---
tags: [Fehler]
created: 2026-11-10 17:30
bereich: Ollama / Infrastruktur
updated: 2026-11-10
status: gelöst
---

# FEHLER-2026-11-10: Ollama "bad manifest – The system cannot find the path specified" wegen Leerzeichen im Modell-Pfad

## Symptom
- `ollama list` (CLI) zeigte Modelle, aber `curl http://localhost:11434/api/tags` lieferte `{"models":[]}`.
- OmniRoute konnte Ollama nicht nutzen: Provider-Test "Unsupported state or unable to authenticate data", CredentialHealth "Invalid outbound URL".
- Server-Log: `bad manifest name=registry.ollama.ai/library/... error="The system cannot find the path specified."` für **alle** Manifests.
- `/v1/models` und `/v1/chat/completions` (OpenAI-compat) lieferten 404/leere Liste.

## Kontext
- `OLLAMA_MODELS=E:\AI-System 3.0\ollama-models` (Machine-Env-Var) — Pfad enthält **Leerzeichen**.
- Ollama 0.40.16's Manifest-Loader kann Blob-Pfade mit Leerzeichen nicht auflösen.
- OmniRoute-Verbindung `ollama-local` (main) hatte `baseUrl=http://localhost:11434/` (korrekt), aber Ollama's HTTP-API war tot.
- Eine zweite Verbindung `ollama-local-fallback` hatte **keine** baseUrl → "Invalid outbound URL".

## Lösung
1. `subst X: "E:\AI-System 3.0\ollama-models"` — virtuelles Laufwerk ohne Leerzeichen.
2. User-Env-Var `OLLAMA_MODELS=X:\` gesetzt.
3. Autostart-Script `ollama-subst.bat` in `%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\` abgelegt.
4. Ollama neu gestartet → `/api/tags` zeigt jetzt alle 10 Modelle, `/v1/models` und `/v1/chat/completions` funktionieren.
5. OmniRoute-Chat mit `ollama-local/qwen3.5:2b` erfolgreich verifiziert.
6. Defekte Fallback-Verbindung (`ollama-local-fallback`) aus OmniRoute entfernt.

## Learnings
- Ollama's Manifest-Loader kann keine Modell-Pfade mit Leerzeichen verarbeiten → immer einen Pfad ohne Leerzeichen verwenden (subst, kurzer Pfad oder verschieben).
- `ollama list` (CLI) liest Manifests direkt von Disk und zeigt Modelle, auch wenn der HTTP-Server sie nicht laden kann → CLI ≠ HTTP-API.
- "Port belegt / Ollama läuft" ≠ "Modelle verfügbar" — immer `/api/tags` prüfen.
- OmniRoute's `providers test` für Ollama gibt "Provider test not supported" zurück — das ist kein Fehler, sondern Design. Chat-Funktionalität stattdessen prüfen.

## Offene Baustelle
- Nach Reboot muss `subst` vor Ollama laufen. Autostart-Script kümmert sich darum, aber bei schnellem Boot kann die Ollama-Desktop-App vor dem Script starten → dann Models leer. Ggf. Ollama-Desktop-Autostart deaktivieren und manuell starten.
- Machine-Env-Var `OLLAMA_MODELS` konnte nicht gesetzt werden (keine Admin-Rechte). User-Level reicht für den aktuellen User.