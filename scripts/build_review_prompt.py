# -*- coding: utf-8 -*-
"""Erstellt einen Review-Prompt für die Phase-3-Skripte."""
import json
from pathlib import Path
import sys

REVIEWER_MODEL = "codellama:latest"
OLLAMA_URL = "http://127.0.0.1:11434/api/generate"

SKRIPTS = [
    "scripts/inbox_parser.py",
    "scripts/task_router.py",
    "scripts/status_reporter.py",
]

def load_script(path):
    return Path(path).read_text(encoding="utf-8")

def main():
    texts = []
    for s in SKRIPTS:
        try:
            texts.append(f"=== {s} ===\n{load_script(s)}")
        except FileNotFoundError:
            print(f"FEHLER: {s} nicht gefunden", file=sys.stderr)
            sys.exit(1)

    code = "\n\n".join(texts)

    prompt = f"""Du bist ein strenger Code-Reviewer im AI-System 3.0 Codeguardian.

PRÜFUNGSLISTE:
- Schritt-Kommentare: Jede öffentliche Funktion hat klar nummerierte Schritte (# Schritt N: ...)
- Doctests: Mindestens 1 Happy-Path + 1 Edge-Case pro öffentlicher Funktion
- Typ-Hints: Python — durchgängig, keine 'any' in TypeScript, keine impliziten Types
- Fehlerbehandlung: Try/Except + Logging bei externer IO
- Keine Hardcoded Secrets (API-Keys, Passwörter)

DOCTEST-ERGEBNISSE:
Exit-Code: 0 (alle Tests bestanden)
4 passed in 0.44s

SKRIPTHIERARCHIE:
- inbox_parser.py: Parst OMNI-INBOX.md → strukturierte Tasks
- task_router.py: Routing von Tasks zu Agents/Tools
- status_reporter.py: Generiert Status-Reports

CODE:
{code}

AUFTRAG:
1. Prüfe jeden Code auf die 5 Kriterien oben
2. Gib eine klare Einschätzung pro Kriterium
3. Fasse das Gesamtergebnis zusammen (bestanden / fehlgeschlagen)
4. Zähle Abweichungen

ANTWORTE STRUKTURIERT:
## Schritt-Abgleich
[Tabelle: Schritt | Erwartet | Tatsächlich | Status]

## Input/Output
[Beispiel-Aufrufe]

## Verifikation
[Kriterien-Checkliste]

## Fazit
Status: [bestanden/fehlgeschlagen]
Abweichungen: [Anzahl]
Begründung: [kurz]
"""
    print(prompt)

if __name__ == "__main__":
    main()
