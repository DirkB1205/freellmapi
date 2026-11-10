# Telegram-Integration Workflow (Bot: @dirkb_bot)

## Ziel
Der Bot @dirkb_bot kann Text, Bilder, Videos und Sprachnachrichten empfangen und diese automatisch verarbeiten. Alle Anweisungen werden an das AI-System 4.0 weitergeleitet.

## Infrastruktur

| Komponente | Pfad / Ort | Status |
|---|---|---|
| Bot-Token | OpenCode Secret Management (`secrets/telegram_bot_token`) / `code/omni-dashboard/messenger-config.json` | **Konfiguriert** |
| Bot-Username | `@dirkb_bot` | fest |
| Webhook-URL | `https://<domain>/telegram/webhook` | **Nicht konfiguriert** (Long-Polling aktiv) |
| Bot-API | `https://api.telegram.org/bot<token>` | bereit |
| **Aktiver Telegram-Poller** | **AI-SYSTEM v4** — `Projekte/ai-system-v4/index.mjs` (Port 8130, PID ~36976) | **Läuft (getUpdates Long-Polling)** |
| Inaktiver Poller (gestoppt) | `code/omni-dashboard/messenger-bridge.js` | **Gestoppt** — verursachte 409 Conflict |
| Verarbeitungs-Pipeline | `08_Workflows/Telegram_Integration.md` (dieses Dokument) | aktiv |

## Nachrichtentypen & Verarbeitung

| Typ | Telegram-Field | Verarbeitung | Ziel |
|---|---|---|---|
| Text | `message.text` | Prompt-Master parse → Task-Vertrag | `09_Prompts/` |
| Bild | `message.photo` | OCR / Bild-Beschreibung → Kontext | `07_Recherche/` |
| Video | `message.video` | Frame-Extraction → Zusammenfassung | `07_Recherche/` |
| Voice | `message.voice` | Speech-to-Text → Text | `09_Prompts/` |
| Dokument | `message.document` | Text-Extraktion | `07_Recherche/` |

## Workflow-Schritte

### 0. Befehle
| Befehl | Wirkung |
|---|---|
| `/start` | Verbindungs-Bestätigung + Hinweis zu Chats (`@default`, `@social`, …) |
| `/chats` oder `/chat` | Auflistung der definierten Chats |
| `/reset` | Löscht die Chat-Kennzeichnung |
| `/status` | **Aktueller Stand** (OpenCode Chats, offene Orchestrator-Tasks, offene Inbox-Einträge) → Telegram-Nachricht an den Nutzer |

### 1. Webhook empfangen
```http
POST /telegram/webhook
Content-Type: application/json
```
Body: Telegram Update-Objekt.

### 2. Typ ermitteln
```python
if "text" in message:      -> Text-Pfad
elif "photo" in message:   -> Bild-Pfad
elif "video" in message:   -> Video-Pfad
elif "voice" in message:   -> Sprach-Pfad
elif "document" in message: -> Dokument-Pfad
```

### 3. Verarbeiten
- **Text**: Direkt an Prompt-Master, Antwort per `sendMessage` zurück.
- **Bild**: Bild wird heruntergeladen, visuell analysiert, Beschreibung als Kontext angehängt.
- **Video**: Schlüssel-frames extrahiert, zusammengefasst, Text-Auszug erstellt.
- **Voice**: `voice`-Field → Speech-to-Text (z.B. Whisper) → Text → Prompt-Master.
- **Dokument**: Datei herunterladen, Text-Extraktion (PDF/DOCX/MD), Inhalt analysiert.

### 4. Antwort
Antwort wird an denselben Chat gesendet (`chat.id`). Bei langen Antworten: Chunking in ≤4096 Zeichen.

## Security-Hinweise
- Bot-Token niemals in Logs, Code oder Docs speichern → nutze OpenCode Secret Management.
- Webhook-URL sollte HTTPS sein.
- Eingehende Nachrichten auf Schadcode prüfen (Security-Agent).
- Keine Ausführungen aus Bot-Nachrichten ohne Bestätigung (Coding-Guideline-Agent).

## Setup-Anleitung

### 1. Bot erstellen
```
@BotFather -> /newbot -> Name: AI System 4.0 Bot -> Username: dirkb_bot
```
Bot-Token von BotFather kopieren → in OpenCode Secrets speichern.

### 2. Webhook setzen
```
https://api.telegram.org/bot<token>/setWebhook?url=<webhook_url>
```

### 3. Secrets konfigurieren
```
opencode secrets set telegram_bot_token <token>
opencode secrets set telegram_webhook_url <url>
```

### 4. Environment
```
TELEGRAM_BOT_TOKEN=<aus Secrets>
TELEGRAM_WEBHOOK_URL=<aus Secrets>
```

## Integration mit AI-System 4.0
Jede eingehende Nachricht wird über den Prompt-Master in einen Task-Vertrag gewandelt (siehe `09_Prompts/Telegram_Task_Contract.md`). Die Verarbeitung läuft über ECC-Agenten (Planner → Architect → TDD-Guide → Code-Reviewer → Security-Reviewer).

## Status
- [ ] Bot-Token konfiguriert
- [ ] Webhook gesetzt
- [ ] Verarbeitungs-Server läuft
- [ ] Testnachricht gesendet

## Status-Befehl /status (2026-11-10)
- **Implementiert** in drei Pfaden:
  1. **AI-SYSTEM v4** — `Projekte/ai-system-v4/index.mjs` (Port 8130, **alleiniger Live getUpdates-Poller**)
  2. `code/omni-dashboard/messenger-bridge.js` — **nicht mehr als Telegram-Poller aktiv** (gestoppt, verursachte 409 Conflict)
  3. `code/orchestrator/orch/daemon.py` + `orch/cli.py` — Webhook-Pfad (komplementär)
- Quellen: OpenCode-Sessions (`opencode.db`, via orch CLI `tasks`), Chats (`chats.json`), offene Inbox-Einträge (`OMNI-INBOX.md`).
- Antwort wird per `sendMessage` an den abfragenden Chat zurückgesendet (Telegram-Limit ≤4096 Zeichen beachtet).
- CLI-Basis: `python -m orch.cli tasks [--json] [--limit N]`.

## Wichtige Architektur-Entscheidung: Ein getUpdates-Poller pro Bot-Token (2026-11-10)
**Lektion gelernt:** Telegram erlaubt **nur einen** aktiven `getUpdates`-Poller pro Bot-Token. Parallele Poller (AI-SYSTEM v4 + messenger-bridge.js) führten zu permanentem `409 Conflict` mit exponentiellem Backoff.
- **Lösung:** `messenger-bridge.js` als Telegram-Poller **gestoppt**; **AI-SYSTEM v4 (Port 8130) ist jetzt der einzige** getUpdates-Poller.
- Details: `05_Fehler/FEHLER-2026-11-10_telegram-getupdates-duplikat-poller.md` + `04_Learnings/LEARNING-2026-11-10_single-getupdates-poller.md`.
- Falls Webhook gewünscht: Webhook setzen (`setWebhook`) → `getUpdates` wird automatisch deaktiviert; AI-SYSTEM v4 müsste dann Webhook-Modus nutzen.