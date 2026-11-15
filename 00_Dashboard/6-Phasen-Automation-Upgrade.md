---
tags: [Plan, Automation]
created: 2026-11-09
updated: 2026-11-09
---

# 6-Phasen-Automation-Upgrade (AI-System 4.0)

**Ziel:** Jede Aufgabe läuft vom Boss-Eintrag in der Inbox bis zur Status-Meldung ohne manuellen Trigger.
**Ist-Zustand:** Jeder Schritt braucht manuellen Trigger. Zielzustand: Phase N beendet → startet automatisch Phase N+1 (nur Gates unterbrechen für Boss-Entscheidungen).

| # | Phase | Was passiert | Skill / Tool | Eingang | Ausgang | Gate (Weiter nur wenn) |
|---|-------|--------------|--------------|---------|---------|------------------------|
| 1 | **Klärungsfragen** | Vage Eingabe → prüfbare Aufgabe. Max. 3 Rückfragen, sonst Default annehmen + dokumentieren. | `promptmaster` + `ask-user-question` | Inbox-Eintrag / Boss-Nachricht | Task-Vertrag (Ziel, Risiko, DoD) | DoD ist maschinenprüfbar (Befehl/Ergebnis) |
| 2 | **Plan-Gate** | Plan erstellen + prüfen. Bei hohem Risiko (Daten, Secrets, irreversible Aktionen) Council-Runde; sonst Solo-Plan. Boss-Gate bei Risiko ≥ mittel. | `blueprint` + `council` (optional) | Task-Vertrag | Plan mit Schritten, Dateien, Abhängigkeiten | Boss-Freigabe (Risiko ≥ mittel) bzw. Plan hat je Schritt ein Verifikationskriterium |
| 3 | **Auto-Dispatch** | Plan an Agenten routen, parallele unabhängige Schritte parallel. Fortschritt in OMNI-INBOX.md + Projekt-Dossier. | `orchestrator` | Freigabener Plan | Ausführung (Subagenten/CLI) | Keiner – läuft bis Step-Fehler oder -Erfolg |
| 4 | **Auto-Test** | Nach jedem Step: Testen. Fehler → Debug-Loop (max. 3 Zyklen), dann Eskalation an Boss. | `verification-loop` + `debug-loop` | Ergebnis des Steps | PASS/FAIL-Report mit Original-Ausgaben | Alle Tests grün für den Step |
| 5 | **Coverage-Enforcement** | Abgeschlossene Features brauchen ≥ 100 % Coverage auf geänderte Module (Minimum 80 % Gesamtdurchsatz wie Social-Dashboard). Kein Merge/`[x]` ohne Coverage-Beweis. | `test-collaboration` + Coverage-Runner (pytest/Playwright je Stack) | Test-Report | Coverage-Report als Beweisspur im Dossier | Coverage-Ziel erreicht, sonst Phase 4 erneut |
| 6 | **Status-Meldung** | Ergebnis an Boss melden: Telegram-Push + (optional) Sprachnachricht. Inbox-Eintrag auf `[x]` mit Lösung. | `send-telegram.ps1` / `send-voice-telegram.ps1` (Skill `omni-notify`) | Coverage-Report | Boss-Nachricht + geschlossener Inbox-Eintrag | Telegram-Absende-Status `OK` |

## Fehlerpfade (gilt für alle Phasen)

| Fehler | Verhalten |
|--------|-----------|
| Step schlägt 3× fehl | Boss-Eskalation per Telegram + Fehler-Note in `05_Fehler/`, Phase hält |
| Provider unreachable | Retry 3× mit Backoff → Ollama-Fallback → Eskalation (Guideline §3) |
| Gate-Timeout (Boss-Antwort ausstehend) | Status in OMNI-INBOX.md, kein Auto-Weiter ohne Freigabe |
| Coverage < Ziel | Phase 5 verweigert Abschluss → zurück zu Phase 4 |

## Rollout (Reihenfolge)

1. **Phase 4 + 6** erst (Auto-Test + Status-Meldung) – größte Wirkung, geringstes Risiko.
2. **Phase 5** (Coverage-Enforcement) – an Social-Dashboard pilotieren (hat schon pytest/Playwright-Basis).
3. **Phase 3** (Auto-Dispatch) – Orchestrator-Regeln um Routing erweitern.
4. **Phase 1 + 2** (Klärung + Plan-Gate) – zuletzt, weil sie das Eingangsverhalten für ALLE Chats ändern.

## Offen

- Coverage-Ziel „100 %" gilt für geänderte Module; Gesamtdurchsatz-Schwelle bleibt 80 % (entspricht Social-Dashboard-Nachweis vom 2026-11-08).
