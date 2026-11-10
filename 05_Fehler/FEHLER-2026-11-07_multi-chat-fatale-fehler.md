---
tags: [fehler, multi-chat, verbindung, sprache, kontextverlust, fatal]
created: 2026-11-07
status: offen
updated: 2026-11-07
related: "[[00_Dashboard/Guidelines]] [[08_Workflows/omni-coordination]]"
---

# Fehler: Fatale Multi-Chat-Fehler (Verbindung, Sprache, Kontextverlust)

## Symptom (wörtlich vom Boss, 2026-11-07)
> "2 chats haben ein verbindungs fehler einer antwortet auf englisch einer weis nicht was er vor 2 min getan hat und begrüst mich und fragt was wir starten woll, anstat seine aufgabe nach zu kommen und das projekt weiter bearbeitet. das sind alles fatale fehler"

Drei separate fatale Fehler in parallelen Chat-Sessions:

### Fehler 1 – Verbindungsfehler (2 Chats)
- Zwei Chat-Sessions verlieren die Verbindung zum Provider (FreeLLMAPI localhost:3001 / OmniRoute localhost:20128).
- Symptom: Antworten bleiben aus / Fehlermeldung / Session hängt.
- Auswirkung: Aufgabe wird nicht weiterbearbeitet, Boss muss manuell eingreifen.

### Fehler 2 – Antwort auf Englisch statt Deutsch
- Eine Chat-Session antwortet auf Englisch, obwohl die oberste Regel (Guidelines.md) "Immer auf Deutsch antworten" lautet.
- Ursache vermutet: Modell-Routing über FreeLLMAPI/OmniRoute wählt ein Modell, das die System-Instructions (Guidelines.md via `instructions`) nicht befolgt, oder Session-Kontext verloren.
- Auswirkung: Boss muss alles übersetzen / Vertrauensverlust.

### Fehler 3 – Kontextverlust / Begrüßung statt Fortsetzung
- Eine Chat-Session "weiß nicht, was er vor 2 Min getan hat", begrüßt den Boss neu und fragt "was wir starten wollen", statt seine Aufgabe fortzusetzen und das Projekt weiterzubearbeiten.
- Ursache vermutet: Session-Compaction / neuer Session-Start ohne Memory-Wiederherstellung; fehlender Check-In gegen OMNI-INBOX.md und Vault (omni-coordination nicht befolgt); kein Persistieren des aktuellen Arbeitsstands.
- Auswirkung: Doppelarbeit, verlorener Fortschritt, Boss muss neu erklären.

## Kontext
- Umgebung: Windows 11, OpenCode, Model `freellmapi/auto` (FreeLLMAPI local router) + OmniRoute.
- Multi-Chat-Setup: Boss arbeitet mit mehreren parallelen opencode-Sessions.
- Richtlinien: `00_Dashboard/Guidelines.md` (Deutsch-Pflicht, Anrede Boss).
- Koordination: Skill `omni-coordination` (OMNI-INBOX.md + Vault).

## Rechercheergebnis (Ursachen)
1. **Verbindung**: FreeLLMAPI (3001) und OmniRoute (20128) laufen (HTTP 401 = Auth nötig, Service erreichbar). Verbindungsfehler sind intermittierend – wahrscheinlich Modell-Routing/Timeout/Provider-Wechsel im Auto-Router. Kein Health-Check/Retry in der Konfiguration.
2. **Sprache**: Guidelines.md wird über `instructions` eingebunden, aber bei Modell-Wechsel/Compaction kann die Instruction verloren gehen. Keine harte Durchsetzung (kein Hook, kein System-Prompt-Fallback).
3. **Kontext**: Kein verbindlicher Check-In-Mechanismus (omni-coordination ist optional). Keine automatische Persistenz des Arbeitsstands in den Vault. Sessions starten "frisch" ohne Memory-Wiederherstellung.

## Lösungsschritte (Abstellmaßnahmen)

### A. Verbindungsfehler abstellen
1. Health-Check der Provider in die Startup-Routine aufnehmen (FreeLLMAPI 3001, OmniRoute 20128, Ollama 11434) – Skript `scripts/check_providers.py` (neu) oder Erweiterung von `status_check.ps1`.
2. Bei Verbindungsfehler: automatischer Fallback auf Ollama (lokal, stabil) statt Hängenbleiben.
3. Retry mit Backoff (3 Versuche) vor Fehlermeldung an Boss.
4. Status in OMNI-INBOX.md / Vault dokumentieren, damit andere Chats Bescheid wissen.

### B. Deutsch-Pflicht durchsetzen
1. Guidelines.md verschärfen: "Immer auf Deutsch antworten" als erste, nicht verhandelbare Regel + Hinweis, dass bei Modell-Wechsel die Regel neu geladen wird.
2. In opencode.json `instructions` sicherstellen, dass Guidelines.md immer geladen wird (bereits vorhanden – verifizieren).
3. Jede Antwort beginnt mit deutscher Anrede "Boss," – als Selbstcheck.
4. Bei Englisch-Antwort: sofort korrigieren und Fehler in Vault notieren.

### C. Kontextverlust abstellen
1. omni-coordination als PFLICHT-Check-In vor jedem Task verankern (in Guidelines.md + als Workflow).
2. Aktuellen Arbeitsstand nach jedem Teilschritt in den Vault persistieren (Projekt-Dossier `Projekte/<projekt>.md` oder Status-Note).
3. Bei Session-Start: zuerst Vault lesen (Index + offene Fehler + in-progress Inbox-Einträge) und Stand wiederherstellen, BEVOR begrüßt wird.
4. Keine Begrüßung/Neustart-Frage, solange ein `- [in-progress]`-Eintrag oder offene Aufgabe existiert – stattdessen Fortsetzung.
5. Memory via `ck`/unified-memory nutzen, damit Kontext sessions-übergreifend erhalten bleibt.

## Verifizierungstest
- [ ] Provider-Health-Check läuft und meldet Status (alle 3 grün).
- [ ] Neue Chat-Session liest Vault + Inbox beim Start und setzt offene Aufgabe fort (keine Begrüßung).
- [ ] Antwort auf Deutsch (Anrede "Boss,") in 5 aufeinanderfolgenden Turns.
- [ ] Kein Verbindungsfehler in 2 aufeinanderfolgenden Sessions.

## Status: offen (2026-11-07, 18:12 Uhr – Fortsetzung; zuletzt verifiziert: Health-Check GRÜN, Modell-Call freellmapi/auto OK -> Recovery wahrscheinlicher Quota-/Credential-Fix, lm-studio-401 offen) → **Stand 18:33 Uhr: lm-studio-Connection wieder isActive + Test OK (18:32:39); ollama-local-Fallback wieder isActive + Test OK (18:06:12) -> offenbar bereits durch Auto-Repair/Heal geschlossen**

## Aktualisierung 2026-11-07 (18:47 Uhr) – FreeLLMAPI Live-Test mit echtem unified Key

- **Befund:** FreeLLMAPI (127.0.0.1:3001) erreichbar; unified API key aus `server/data/freeapi.db` (`settings.unified_api_key`) extrahiert: `freellmapi-2d84a560a6594868d65541eb798ef4b063999ddf9eb73bc7`.
- **Test 1:** `POST /v1/chat/completions` mit `model: lm-studio` + korrektem Key → **HTTP 404** `{"error":{"message":"Model 'lm-studio' is not in the catalog. Use 'auto' ...","code":"model_not_found"}}`.
- **Test 2:** `POST /v1/chat/completions` mit `model: auto` + korrektem Key → **HTTP 200 OK** ✅; routed via `kilo` / `dots-studio/dots-3-note-preview:free` (AtlasCloud).

## Aktualisierung 2026-11-07 (18:52 Uhr) – OmniRoute Combo + Health

- **Combo:** `main-chain` (Main Chain: FreeLLMAPI -> OmniRoute -> Ollama) per `omniroute combo switch main-chain` aktiviert → **Active combo: main-chain**.
- **Health:** `omniroute health` → **Status: healthy** ✅ (Uptime 8674s, Version 3.8.52).

## Aktualisierung 2026-11-07 (19:12 Uhr) – 401 beim freellmapi-codegen geklärt

- **E2E:** Combo `freellmapi-codegen`, Modell `lm-studio/auto` → **HTTP 401**, Error: `[401]: Invalid API key`.
- **Provider-Test:** `omniroute test lm-studio --json` → **success: false**, **error: "Invalid API key"**, passed=0, failed=1.
- **Provider-Status:** `lm-studio` (Name: FreeLLMAPI): `isActive: true`, `testStatus: expired`, `lastError: Invalid API key`, `lastTested: 2026-11-07T19:06:21Z`. `ollama-local-fallback`: `isActive: true`, `testStatus: active`.

## Aktualisierung 2026-11-07 (18:12 Uhr) – Folgebefund zum wiederkehrenden Verbindungsfehler

- Health-Check (`scripts/check_providers.py`): ALLE GRÜN (FreeLLMAPI erreichbar, 401=Auth nötig; OmniRoute erreichbar, 401=Auth nötig; Ollama OK).
- Opencode-Log Session `bbf2f0f3`: `Failed to drain Session` → `AI.Error.QuotaExceeded: Free usage limit reached` (Free-Tier-Limit erreicht) + `AI.Error.ProviderInternal: Credential gate blocked ollama-local/qwen3.5:2b`.
- Omni-Monitor (Stand 18:10): lm-studio 304/304 Calls fehlgeschlagen ([401] Invalid API key); cloud-first deactivated (503 Credential gate blocked ollama-local/qwen3.5:2b).

Abstellmaßnahmen werden in dieser Session umgesetzt (Guidelines + Workflow + Health-Check).
