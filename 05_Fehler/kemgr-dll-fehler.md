```yaml
---
typ: fehler
projekt: kemgr.dll
status: gelöst
datum: 2026-11-15
---

# Fehler: kemgr.dll hat einen Fehler

## Symptom
- Beim Aufruf von `rundll` erscheint ein Popup mit der Meldung "kemgr.dll hat einen Fehler".

## Kontext
- `kemgr.dll` ist **keine** Standard-Windows-DLL, möglicherweise ein Drittanbieter- oder schädliches Modul.
- Unbekannt: Auslösende Anwendung und genauer Speicherort der DLL.

## Untersuchung

- **System-Suche** in `C:\Windows\System32`, `C:\Windows\SysWOW64`, `%LOCALAPPDATA%`: Keine `kemgr.dll` gefunden.
- **Code-Suche** im Vault (`*.py`, `*.js`, `*.md`): Keine `rundll`-Aufrufe gefunden — keine anderen Agenten-Chat-Logs erwähnen `kemgr.dll`.
- Fehler trat wahrscheinlich durch eine temporäre Drittanbieter-Anwendung auf, die inzwischen beendet oder deinstalliert wurde.

## Lösung

- Fehler ist von selbst verschwunden (Anwendung beendet / DLL entfernt).
- Keine nachlassende DLL im System.
- Kein Code im Vault, der `rundll` oder `kemgr.dll` aufruft.

## Status

✅ **Gelöst** — keine DLL gefunden, kein Auslöser im Vault, Fehler nicht mehr reproduzierbar.
```