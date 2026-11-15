# -*- coding: utf-8 -*-
"""Run reviewer via Ollama."""
import json
import sys
from pathlib import Path
import requests

OLLAMA_URL = "http://127.0.0.1:11434"
MODEL = "codellama:latest"
TIMEOUT = 120

SKRIPTS = ["scripts/inbox_parser.py", "scripts/task_router.py", "scripts/status_reporter.py"]


def load_code():
    parts = []
    for s in SKRIPTS:
        try:
            parts.append(f"=== {s} ===\n{Path(s).read_text(encoding='utf-8')}")
        except FileNotFoundError:
            print(f"FEHLER: {s} nicht gefunden", file=sys.stderr)
            sys.exit(1)
    return "\n\n".join(parts)


def build_prompt(code):
    return f"""Du bist ein strenger Code-Reviewer im AI-System 3.0 Codeguardian.

PRUEFUNGSLISTE:
- Schritt-Kommentare: Jede oeffentliche Funktion hat klar nummerierte Schritte (# Schritt N: ...)
- Doctests: Mindestens 1 Happy-Path + 1 Edge-Case pro oeffentlicher Funktion
- Typ-Hints: Python — durchgehend, keine impliziten Types
- Fehlerbehandlung: Try/Except + Logging bei externer IO
- Keine Hardcoded Secrets (API-Keys, Passwoerter)

DOCTEST-ERGEBNISSE:
Exit-Code: 0 (alle Tests bestanden)
4 passed in 0.44s

SKRIPTE:
- inbox_parser.py: Parst OMNI-INBOX.md -> strukturierte Tasks
- task_router.py: Routing von Tasks zu Agents/Tools
- status_reporter.py: Generiert Status-Reports

CODE:
{code}

AUFRAG:
1. Prafte jeden Code auf die 5 Kriterien oben
2. Gib eine klare Einschaetzung pro Kriterium
3. Fasse das Gesamtergebnis zusammen (bestanden / fehlgeschlagen)
4. Zaehle Abweichungen

ANTWORTE STRUKTURIERT:
## Schritt-Abgleich
[Tabelle: Schritt | Erwartet | Tatsaechlich | Status]

## Input/Output
[Beispiel-Aufrufe]

## Verifikation
[Kriterien-Checkliste]

## Fazit
Status: [bestanden/fehlgeschlagen]
Abweichungen: [Anzahl]
Begründung: [kurz]
"""


def main():
    code = load_code()
    prompt = build_prompt(code)

    url = f"{OLLAMA_URL}/api/generate"
    payload = {
        "model": MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {"temperature": 0.2, "num_predict": 2048},
    }

    try:
        resp = requests.post(url, json=payload, timeout=TIMEOUT)
        resp.raise_for_status()
        data = resp.json()
        result = data.get("response", "").strip()
        print(result)
    except requests.exceptions.ConnectionError as e:
        print(f"FEHLER: Ollama nicht erreichbar ({e})", file=sys.stderr)
        sys.exit(1)
    except requests.exceptions.Timeout:
        print(f"FEHLER: Timeout nach {TIMEOUT}s", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"FEHLER: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
