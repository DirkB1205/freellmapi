# Telegram Process Skill

## Ziel
Eingehende Telegram-Nachrichten (Text, Bild, Video, Voice) automatisch erfassen, klassifizieren und an das AI-System 4.0 weiterleiten.

## Trigger
- Webhook-Eingang von Telegram (`/telegram/webhook`)
- Manueller Aufruf via `/telegram/process`

## Input-Formate

| Typ | Feld | Behandlung |
|---|---|---|
| Text | `message.text` | Prompt-Master → Task-Vertrag |
| Bild | `message.photo[]` | Herunterladen → visuelle Analyse → Kontext |
| Video | `message.video` | Frame-Extraktion → Zusammenfassung |
| Voice | `message.voice` | Speech-to-Text → Text |
| Dokument | `message.document` | Herunterladen → Text-Extraktion |

## Verarbeitungs-Pipeline

```
Telegram Webhook
  → Typ-Erkennung
  → Typ-spezifische Vorverarbeitung
  → Prompt-Master (Task-Vertrag)
  → ECC Agent-Chain (Planner → Architect → TDD → Reviewer)
  → Antwort an Telegram-Chat
```

## Output
Antwort als Telegram-Nachricht (`sendMessage`), chunked auf ≤4096 Zeichen.

## Security
- Bot-Token aus OpenCode Secret Management (nie in Code/Logs)
- Eingaben auf Schadcode prüfen (Security-Agent)
- Keine Ausführungen ohne Bestätigung (Coding-Guideline-Agent)

## Dependencies
- Telegram Bot API (`https://api.telegram.org`)
- OpenCode Secret Management
- Optional: Whisper (STT), ffmpeg (Video-Frame-Extraction)

## Status
- [ ] Implementiert
- [ ] Getestet
- [ ] Produktiv