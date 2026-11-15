---
typ: fehler
projekt: codeguardian
datum: 2026-11-12T09:15:00
status: dokumentiert
komponente: pre-commit-hook
severity: mittel
---

# Error: Pre-Commit Hook schlägt auf Windows fehl — `sh` nicht verfügbar

**Datum:** 2026-11-12T09:15:00
**Branch:** `freellmapi-isolated`
**Commit:** `1879df10` (Review-Note + OMNI-INBOX.md committed mit `--no-verify`)

## Symptom

```
$ git commit -m "feat: media pipeline review + inbox update"
.git/hooks/pre-commit: line 1: #!/bin/sh: No such file or directory
error: cannot run .git/hooks/pre-commit: No such file or directory
```

Der Pre-Commit-Hook (`.git/hooks/pre-commit`) ist ein Unix-Shell-Skript (`#!/bin/sh`). Auf Windows ist `sh` standardmäßig nicht im PATH verfügbar (außer via Git Bash, WSL, MSYS2).

## Root Cause

Der Hook ruft `python projects/code-guardian-engine/guardian.py guardian .` auf — das **funktioniert** direkt mit Python. Der Fehler liegt **nicht** im Python-Script, sondern im Shebang/Interpreter des Hooks selbst:

```bash
#!/bin/sh
# Code Guardian Pre-Commit Hook for AI-System 4.0
echo "[Code Guardian] Prüfe Code vor Commit..."
python projects/code-guardian-engine/guardian.py guardian .
```

Windows `cmd.exe` / PowerShell können `#!/bin/sh` nicht auflösen.

## Workaround (angewendet)

Commit mit `--no-verify` + **manuelle Review-Note** (entspricht AGENTS.md Notfall-Override):

```bash
git commit --no-verify -m "feat: media pipeline review + inbox update [REVIEW OVERRIDE] – Hook sh fehlt auf Windows; manuelle Review-Note: codeguardian/media-logs/PRUEFUNG-media-pipeline-2026-11-12T08-30-00.md (status: bestanden, abweichungen: 0)"
```

## Dauerhafte Lösungen (eine wählen)

| Option | Aufwand | Beschreibung |
|--------|---------|--------------|
| **A. Hook als `.cmd` / PowerShell** | gering | `.git/hooks/pre-commit.cmd` mit `python projects/code-guardian-engine/guardian.py guardian .` |
| **B. Git Bash als Shell erzwingen** | gering | Git config `core.hooksPath` auf Git Bash Hooks verweisen, oder Hook mit `#!/usr/bin/env bash` + Git Bash im PATH |
| **C. Husky / node-basierter Hook** | mittel | `husky` installiert, Hooks als JS/TS — plattformunabhängig |
| **D. Pre-Commit Framework (Python)** | mittel | `pip install pre-commit`, `.pre-commit-config.yaml` — plattformunabhängig, cached |
| **E. Direkt `guardian.py` als CLI nutzen** | null | `python projects/code-guardian-engine/guardian.py guardian .` manuell vor Commit (aktueller Workflow) |

## Empfehlung

**Option A** (`.cmd` Hook) — schnellste Windows-native Lösung, keine neuen Dependencies. Beispiel:

```cmd
@echo off
echo [Code Guardian] Pruefe Code vor Commit...
python projects/code-guardian-engine/guardian.py guardian .
if errorlevel 1 (
  echo [Code Guardian] FEHLER: Commit durch Code Guardian blockiert!
  exit /b 1
)
echo [Code Guardian] Alle Pruefungen bestanden.
exit /b 0
```

## Verknüpfungen

- Review-Note: `codeguardian/media-logs/PRUEFUNG-media-pipeline-2026-11-12T08-30-00.md` (bestanden)
- Commit: `1879df10` (Branch `freellmapi-isolated`)
- AGENTS.md: Notfall-Override-Regel (Sektion "Notfall-Override")
- Hook-Datei: `.git/hooks/pre-commit`
- Guardian-Script: `projects/code-guardian-engine/guardian.py` (funktional)