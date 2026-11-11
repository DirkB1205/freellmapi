#!/usr/bin/env python3
"""Provider-Health-Check fuer AI-System 4.0.
Prueft FreeLLMAPI, OmniRoute und Ollama mit Retry + Fallback.
Exit-Code 0 = alle erreichbar, 1 = mindestens einer nicht erreichbar.
Exit-Code 2 = kritischer Fehler (Ollama nicht erreichbar — kein Fallback moeglich).
"""
import json
import sys
import time
import urllib.request
import urllib.error

PROVIDERS = [
    ("FreeLLMAPI", "http://127.0.0.1:3001/v1/models"),
    ("OmniRoute", "http://localhost:20128/v1/models"),
    ("Ollama", "http://127.0.0.1:11434/api/tags"),
]

RETRY_COUNT = 3
RETRY_BACKOFF = 1.5  # Sekunden zwischen Versuchen


def check(name, url):
    """Prueft einen Provider mit Retry-Logik.

    Returns:
        (ok: bool, code: int, msg: str, attempts: int)
    """
    last_err = None
    for attempt in range(1, RETRY_COUNT + 1):
        try:
            req = urllib.request.Request(url, method="GET")
            with urllib.request.urlopen(req, timeout=5) as resp:
                return True, resp.status, "OK", attempt
        except urllib.error.HTTPError as e:
            # 401/403 = Service laeuft, aber Auth noetig -> als "erreichbar" werten
            if e.code in (401, 403):
                return True, e.code, "erreichbar (Auth noetig)", attempt
            last_err = f"HTTP {e.code}"
        except Exception as e:
            last_err = str(e)
        if attempt < RETRY_COUNT:
            time.sleep(RETRY_BACKOFF * attempt)
    return False, 0, last_err or "unbekannt", RETRY_COUNT


def main():
    results = []
    all_ok = True
    ollama_ok = False
    for name, url in PROVIDERS:
        ok, code, msg, attempts = check(name, url)
        results.append({
            "name": name, "url": url, "ok": ok, "code": code,
            "msg": msg, "attempts": attempts,
        })
        status = "GRUEN" if ok else "ROT"
        print(f"[{status}] {name}: {msg} ({url}) — Versuche: {attempts}")
        if name == "Ollama":
            ollama_ok = ok
        if not ok:
            all_ok = False

    # Fallback-Empfehlung: wenn OmniRoute nicht erreichbar, Ollama als Fallback nutzen
    omni_route_ok = next((r["ok"] for r in results if r["name"] == "OmniRoute"), False)
    fallback = None
    if not omni_route_ok and ollama_ok:
        fallback = "OmniRoute nicht erreichbar — Fallback auf Ollama empfohlen"
        print(f"[FALLBACK] {fallback}")

    # Kritischer Fehler: Ollama nicht erreichbar = kein Fallback moeglich
    if not ollama_ok:
        print("---JSON---")
        print(json.dumps({
            "results": results,
            "all_ok": False,
            "fallback": fallback,
            "critical": True,
            "error": "Ollama nicht erreichbar — kein Fallback verfuegbar",
        }, indent=2, ensure_ascii=False))
        sys.exit(2)

    print("---JSON---")
    print(json.dumps({
        "results": results,
        "all_ok": all_ok,
        "fallback": fallback,
        "critical": False,
    }, indent=2, ensure_ascii=False))
    sys.exit(0 if all_ok else 1)


if __name__ == "__main__":
    main()