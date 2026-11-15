# Telegram Task Contract

## Ziel
Eingehende Telegram-Nachrichten (Text, Foto, Video, Voice, Dokument) in einen prüfbaren Task-Vertrag wandeln, der die Verarbeitungspipeline, Ziel-Pfade und Antwort-Regeln eindeutig definiert.

---

## Contract-Struktur

Jede Nachricht erzeugt folgenden Vertrag:

```yaml
typ: telegram-task
datum: YYYY-MM-DDTHH:MM:SS
chat_id: <number>
message_id: <number>
nachrichtentyp: text | photo | video | voice | document
bereich: <default | social | recherche | prompt>
risiko: low | medium | high
dateien:
  - download_pfad
  - verarbeitung_pfad
definition_of_done:
  - medien-download abgeschlossen
  - vorverarbeitung abgeschlossen
  - zusammenfassung/extraktion erstellt
  - vault-eintrag geschrieben
  - telegram-antwort gesendet (≤4096 Zeichen)
offene_fragen: []
```

---

## Nachrichtentypen & Verarbeitung

### Text (`message.text`)

| Schritt | Aktion | Ziel |
|---|---|---|
| 1 | Prompt-Master parse | Task-Vertrag erstellen |
| 2 | ECC-Agenten-Kette | Planner → Architect → TDD → Reviewer |
| 3 | Antwort | `sendMessage` an `chat.id` (≤4096 Zeichen, chunked) |

---

### Foto (`message.photo`)

| Schritt | Aktion | Ziel-Pfad |
|---|---|---|
| 1 | Download | `07_Recherche/Telegram-Medien/photos/{message_id}_{timestamp}.jpg` |
| 2 | Visuelle Analyse | Bildbeschreibung, OCR (falls Text im Bild) |
| 3 | Vault-Eintrag | `07_Recherche/Telegram-Medien/photos/{message_id}_{timestamp}.md` |
| 4 | Antwort | Zusammenfassung + Kontext an `chat.id` |

**Prompt für Bildanalyse:**
```
Du siehst ein Foto aus Telegram. Beschreibe:
1. Was ist im Bild? (Objekte, Personen, Text, Farben)
2. Welcher Kontext ist erkennbar? (Ort, Situation, Stimmung)
3. Gibt es lesbaren Text? (OCR-Transkript)
4. Welche Aktion folgt daraus für das AI-System 4.0?
```

---

### Video (`message.video`)

| Schritt | Aktion | Ziel-Pfad |
|---|---|---|
| 1 | Download | `07_Recherche/Telegram-Medien/videos/{message_id}_{timestamp}.mp4` |
| 2 | Keyframe-Extraktion (FFmpeg) | `07_Recherche/Telegram-Medien/videos/{message_id}_frames/` |
| 3 | Transkription (Whisper) | `07_Recherche/Telegram-Medien/videos/{message_id}_transcript.txt` |
| 4 | LLM-Zusammenfassung | `07_Recherche/Telegram-Medien/videos/{message_id}_summary.md` |
| 5 | Vault-Eintrag | `07_Recherche/Telegram-Medien/videos/{message_id}.md` |
| 6 | Antwort | Zusammenfassung an `chat.id` (≤4096 Zeichen) |

**Pipeline (AI-Content-Studio):**
```bash
# 1. Download
curl -o "{output_path}" "https://api.telegram.org/file/bot<token>/<file_path>"

# 2. Keyframes (1 Frame pro 10 Sekunden)
ffmpeg -i "{input}" -vf "fps=1/10" "{output_dir}/frame_%03d.jpg"

# 3. Whisper Transkription
python AI-Content-Studio/scripts/whisper_transcribe.py "{input}" --output "{output_txt}"

# 4. LLM Summary
python AI-Content-Studio/scripts/summarize.py "{transcript_txt}" --frames "{output_dir}" --output "{summary_md}"
```

**Prompt für Video-Zusammenfassung:**
```
Du erhältst:
1. Video-Transkript (Whisper)
2. Keyframe-Beschreibungen (optional)

Erstelle:
1. 3-Satz-Zusammenfassung (Kernaussage)
2. Bullet-Liste der Hauptpunkte (max. 5)
3. Handlungsbedarf für AI-System 4.0 (falls vorhanden)
4. Zeitstempel relevanter Passagen (MM:SS → Thema)

Format: Markdown, ≤4096 Zeichen für Telegram-Reply.
```

---

### Voice (`message.voice`)

| Schritt | Aktion | Ziel-Pfad |
|---|---|---|
| 1 | Download | `09_Prompts/Telegram-Voice/{message_id}_{timestamp}.ogg` |
| 2 | Speech-to-Text (Whisper) | `09_Prompts/Telegram-Voice/{message_id}_transcript.txt` |
| 3 | Prompt-Master | Task-Vertrag aus Transkript |
| 4 | Antwort | Bestätigung + nächste Schritte an `chat.id` |

**Hinweis:** Voice-Nachrichten landen in `09_Prompts/` (nicht `07_Recherche/`), da sie primär Prompt-Input sind.

**Prompt für STT-Qualitätsprüfung:**
```
Transkript einer Telegram-Voice-Nachricht. Prüfe:
1. Ist der Text vollständig? (Abbrüche, unleserliche Passagen markieren)
2. Welche Intention hat der Sprecher? (Frage, Anweisung, Idee, Feedback)
3. Welche konkrete Aktion folgt?
```

---

### Dokument (`message.document`)

| Schritt | Aktion | Ziel-Pfad |
|---|---|---|
| 1 | Download | `07_Recherche/Telegram-Medien/documents/{message_id}_{filename}` |
| 2 | Text-Extraktion | `07_Recherche/Telegram-Medien/documents/{message_id}_text.txt` |
| 3 | Analyse | Inhalt, Typ, Relevanz |
| 4 | Vault-Eintrag | `07_Recherche/Telegram-Medien/documents/{message_id}.md` |
| 5 | Antwort | Zusammenfassung + Extrakt an `chat.id` |

**Text-Extraktion nach Typ:**
- PDF: `pdftotext` oder `pypdf`
- DOCX: `python-docx`
- MD/TXT: Direkt lesen
- XLSX: `openpyxl` (erste 100 Zeilen)

---

## Telegram-Reply-Regeln

### Chunking (≤4096 Zeichen)

```python
def send_chunked(bot, chat_id, text):
    max_len = 4096
    chunks = [text[i:i+max_len] for i in range(0, len(text), max_len)]
    for i, chunk in enumerate(chunks):
        if i == 0:
            bot.sendMessage(chat_id=chat_id, text=chunk)
        else:
            bot.sendMessage(chat_id=chat_id, text=f"(Fortsetzung {i+1}/{len(chunks)})\n{chunk}")
```

### Antwort-Format

1. **Kurzfassung first** (1-2 Sätze)
2. **Details** (Bullets, maximal 5)
3. **Nächste Schritte** (konkrete Aktion)
4. **Bei Medien:** Link zum Vault-Eintrag

---

## Security & Limits

| Regel | Wert |
|---|---|
| Max. Dateigröße Download | 20 MB (Telegram-Limit) |
| Max. Reply-Länge | 4096 Zeichen pro Nachricht |
| Rate Limit | ≤30 Nachrichten/Minute pro Chat |
| Bot-Token | OpenCode Secret Management (`secrets/telegram_bot_token`) |
| Keine Ausführung | Kein Code aus Nachrichten ohne Bestätigung |

---

## Integration mit AI-System 4.0

```
Telegram-Nachricht
  → index.mjs (getUpdates, Port 8130)
  → Typ-Erkennung (text/photo/video/voice/document)
  → Download + Vorverarbeitung (dieser Contract)
  → Prompt-Master (Task-Vertrag finalisieren)
  → ECC-Agenten (Planner → Architect → TDD → Reviewer)
  → Vault-Eintrag (Obsidian)
  → Telegram-Reply (chunked)
```

---

## Status

- [x] Contract dokumentiert
- [ ] Download-Logik implementiert (`index.mjs`)
- [ ] FFmpeg-Integration (Video-Keyframes)
- [ ] Whisper-Integration (STT)
- [ ] Vault-Autoschreib-Logik
- [ ] Reply-Chunking implementiert

---

## Verknüpfungen

- `08_Workflows/Telegram_Integration.md` — Gesamt-Workflow
- `03_Skills/Telegram_ProcessSkill.md` — Skill-Dokumentation
- `AI-Content-Studio/README.md` — Video-Pipeline (Whisper + FFmpeg)
- `07_Recherche/Telegram-Medien/README.md` — Medien-Checkpoint
- `Projekte/ai-system-v4/index.mjs` — Aktiver Poller (Port 8130)
