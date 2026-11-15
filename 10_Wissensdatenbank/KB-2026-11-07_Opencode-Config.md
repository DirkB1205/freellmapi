---
tags: [Wissen, Konfiguration, OpenCode]
created: 2026-11-07
updated: 2026-11-07
---

# KB-2026-11-07 — OpenCode-Konfiguration

## Fakten

- **Config-Datei (vault-lokal):** `E:\AI-System 3.0\opencode.json`
- **Config-Datei (global):** `C:\Users\DirkBieler\.config\opencode\opencode.json`
- **Sicherheit:** Alle Secrets als `{env:...}`-Referenzen, keine Klartexte
- **Provider:** freellmapi (lokal), omniroute (lokal)
- **MCP-Server:** obsidian (derzeit nicht funktionsfähig)
- **Telegram:** Bot `@dirkb_bot`, Token als `{env:TELEGRAM_BOT_TOKEN}`

## Konfigurierte Provider

| Provider | Name | Base-URL | Modell |
|---|---|---|---|
| freellmapi | FreeLLMAPI (local) | http://127.0.0.1:3001/v1 | auto |
| omniroute | OmniRoute | http://localhost:20128/v1 | lm-studio/auto, main-chain |

## Konfigurierte Umgebungsvariablen

| Variable | Zweck | Status |
|---|---|---|
| `FREELLMAPI_API_KEY` | FreeLLMAPI API-Schlüssel | Konfiguriert |
| `OMNIROUTE_API_KEY` | OmniRoute API-Schlüssel | Konfiguriert |
| `TELEGRAM_BOT_TOKEN` | Telegram Bot-Token | Muss konfiguriert werden |
| `TELEGRAM_WEBHOOK_URL` | Telegram Webhook-URL | Optional |

## Wichtige Abschnitte

- `provider` — API-Provider-Konfiguration
- `mcp` — MCP-Server (obsidian)
- `telegram` — Telegram-Bot-Konfiguration
- `tools` — Tool-Berechtigungen
- `rules` — Projekt-Regeln
- `instructions` — Verweis auf Guidelines.md

## Quellen

- `E:\AI-System 3.0\opencode.json` — Vault-lokale Konfiguration
- `C:\Users\DirkBieler\.config\opencode\opencode.json` — Globale Konfiguration
- `00_Dashboard/Guidelines.md` — Richtlinien-Referenz