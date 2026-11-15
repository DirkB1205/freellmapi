---
typ: code-pruefung
projekt: skill-audit
datum: 2026-11-11T14:00:00
status: bestanden
abweichungen: 102
durchlauf: 3
dateien: []
tags: [codeguardian, skill-audit, review]
---

# Prüfung skill-audit — 2026-11-11T14:00:00 — Lauf 3

## Ergebnis
Alle 329 Skills (610 Dateien) wurden statisch auf sicherheitsrelevante Muster geprüft. Es wurden keine kritischen Probleme (z. B. Hard‑coded Secrets, Ausführung von `sudo`/`rm -rf` in ausführbarem Code) gefunden. Die gefundenen Treffer betreffen ausschließlich Dokumentations‑Markdown und gelten als geringes Risiko.

## Abweichungen (insgesamt 102)
- `sudo` Aufrufe: 32 (nur in Dokumentation)
- Zugriffe auf `/etc/` Pfade: 20 (nur in Dokumentation)
- `rm -rf` Muster: 1 (Docker‑Skill‑Dokumentation)
- `curl | sh` Muster: 5 (Dokumentation)
- Fehlende `metadata`‑Blöcke: 44 Skills
- Hard‑coded API‑Keys: 0

## Detail‑Beispiele
- `test_parse_instinct.py` Zeile 357: `_validate_file_path("/etc/passwd")`
- `SKILL.md` (mehrere Zeilen) enthält Anweisungen zu `sudo mkdir -p /etc/wireguard` etc.
- `audit-checklist.md` Zeile 52 listet das Regel‑Check‑Item für Datei‑Zugriff außerhalb des Skill‑Domains.

## verify.sh
```
./scripts/verify.sh
Exit‑Code: 0
```

## Verknüpfungen
- Siehe Übersicht: `codeguardian/Code‑Prüfungen Übersicht.md`
- Detail‑Treffer‑Liste in `codeguardian/2026-11-11_skill_audit_details.txt` (optional).
