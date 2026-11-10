---

tags: [Fehler]
created: 2026-11_09
updated: 2026-11_09
---

# Fehler: OpenCode – „All credentials for model auto are cooling down“

## Aktualisierung 2026-11_09 – OpenCode-Credentials in Cooldown (Retry „Versuch 3“ in 66 s)

- **Symptom:** `All credentials for model auto are cooling down` — zusätzlich Window-Titel des OpenCode-Prozesses: `Opencode credentials cooling down`; Retry-Verlauf: `Versuch 3 wird in 66 Sekunden wiederholt`.
- **Kontext:** OpenCode (Desktop 2.2.0) mit Config `E:\AI-System 3.0\opencode.json`, Model `freellmapi/auto` (FreeLLMAPI Auto Router, `http://127.0.0.1:3001/v1`) schlug fehl; alle Credentials für das Model `auto` standen im Cooldown.

## Root Cause

- OpenCode sendete **keinen bzw. ungültigen API-Key** an den FreeLLMAPI-Proxy.
- Config-Fix nötig: Provider-Block `freellmapi` in `E:\AI-System 3.0\opencode.json` (bzw. `E:\AI-System 3.0\Projekte\freellmapi\opencode.json`) enthielt **kein `options.apiKey`** → OpenCode fiel auf Default/Env-Wert zurück.
- Proxy (FreeLLMAPI, `server/src/routes/proxy.ts`, `requireInferenceAuth`) antwortete darauf mit **401 `Invalid API key`** (`type: authentication_error`).
- Folge: Auth-Fehler → OpenCode setzt Credentials in Cooldown → Retry-Logik → `All credentials for model auto are cooling down` → Wiederholung (`Versuch 3` in 66 s).

## Lösung / Verifikation

- Fix: `options.apiKey` im Provider `freellmapi` auf den gültigen Unified-API-Key gesetzt.
- Verifikation (Live): `GET /v1/models` mit korrektem Key → **200 OK** (Modellliste); mit falschem Key → **401 `Invalid API key`**.
- Unabhängig OK: OmniRoute (`http://localhost:20128/v1`, Key via `OMNIROUTE_API_KEY`) → **200 OK**.

## Status

- **2026-11_09 (final) – STATUS: BEHOBEN / VERIFIERT** — Config-Fix (`options.apiKey` bei Provider `freellmapi`) umgesetzt; OpenCode-Client-Server komplett neu gestartet; Live-Test via `opencode run --model freellmapi/auto` erfolgreich (Antwort „Boss, OK." ohne Cooldown/Auth-Fehler).

## Offen

- Keine. Fehlerumgebung (Cooldown) nach Fix + Runtime-Restart abgebaut; Modell `freellmapi/auto` funktioniert wieder.
