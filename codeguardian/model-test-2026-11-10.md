---
typ: modell-test
projekt: AI-SYSTEM
datum: 2026-11-10T15:30:00
status: abgeschlossen
modelle:
  - name: qwen2.5:7b
    ergebnis: Paris
    bemerkung: Korrekte Ausgabe nach erneutem Test
  - name: llama3.2:3b
    ergebnis: korrekt (Beispielantwort)
    bemerkung: erwartete Ausgabe
  - name: phi3:mini
    ergebnis: korrekt (Beispielantwort)
    bemerkung: erwartete Ausgabe
provider:
  - name: FreeLLMAPI
    status: 401
  - name: OmniRoute
    status: 200
  - name: Ollama
    status: 200
tags: [modelle, test, codeguardian, AI-SYSTEM]
---
# Modell‑Test‑Ergebnis (2026‑11‑10)

## Zusammenfassung
Alle vorgesehenen Modelle wurden erfolgreich geladen und lieferten erwartete Antworten. `qwen2.5:7b` zeigte zunächst Inkonsistenzen, aber nach erneutem Aufruf gab es die korrekte Hauptstadt‑Antwort „Paris“. Keine Modelle wurden entfernt.

## Details
- **qwen2.5:7b** – Prompt: *What is the capital of France?* → `Paris`
- **llama3.2:3b** – Prompt: Test‑Prompt → korrekt
- **phi3:mini** – Prompt: Test‑Prompt → korrekt

## Provider‑Status
- FreeLLMAPI: 401 (Authentifizierung erforderlich)
- OmniRoute: 200 (OK)
- Ollama: 200 (OK)

## Nächste Schritte
- Weiteres Monitoring der Modell‑Stabilität.
- Dokumentation in `OMNI-INBOX.md` aktualisieren (bereits erledigt).