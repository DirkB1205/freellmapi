---
typ: fehler
projekt: opencode
datum: 2026-11-12T19:30:00
status: behoben
komponente: compaction
severity: mittel
---

# Error: "Compaction produced no summary" — Opencode Session

**Datum:** 2026-11-05T13:19:27Z (historisch, behoben 2026-11-12)
**Session-ID:** ses_e59e4c796f...
**Run-ID:** 1a66b1e4

## Symptom

```
Session.StepFailedError: Compaction produced no summary
at <anonymous> (B:/~BUN/root/chunk-49qges38.js:367:3149)
at SessionRunner.runStep (chunk-49qges38.js:367:2686)
at SessionRunner.drain (chunk-53m13hrp.js:18:2552)
at ServerProcess.start (chunk-4wwevqam.js:3:6130)
```

Die Compaction-Pipeline gab keine Zusammenfassung aus, was zum Fehler `Session.StepFailedError` führte. Die Session wurde nicht erfolgreich drainiert.

## Root Cause

In der Opencode-Konfiguration (`opencode.json`) war **kein Modell für `agent.compaction`** gesetzt. Das Default-Verhalten führte dazu, dass die Compaction ohne gültiges Modell lief und keine Summary produzieren konnte.

**Fehlende Config:**
```json
{
  "agent": {
    "compaction": {
      "model": "omniroute/ollama-local/qwen3-coder:30b"
    }
  }
}
```

## Lösung

✅ **Fix angewendet (uncommitted):**
- `agent.compaction.model = "omniroute/ollama-local/qwen3-coder:30b"` in `E:\AI-System 3.0\opencode.json` eingetragen.
- Modell: `qwen3-coder:30b` über Omniroute (ctx 128k, größter verfügbarer Kontext).

**Test empfohlen:** `/compact` in einer OpenCode-Session triggern.

## Verwandte Probleme

- **EPERM Snapshot-Fehler (12.11.2026):** Separater Fehler — `FileSystem.rename` schlägt mit EPERM fehl bei Git-Storage im Snapshot-Verzeichnis. Betrifft nur Snapshots, nicht die Compaction selbst. Kann ignoriert oder durch manuelle Bereinigung behoben werden.

## Dateien

- `E:\AI-System 3.0\opencode.json` — Config (geändert, uncommitted)
- `C:\Users\DirkBieler\.local\share\opencode\log\opencode.log` — Log-Eintrag Zeile ~2740

## Verifikations-Schritte

1. `git diff opencode.json` — Änderung prüfen
2. `/compact` in OpenCode ausführen → sollte jetzt erfolgreich sein
3. Optional: `rm -r C:\Users\DirkBieler\.local\share\opencode\snapshot\.init-*` für EPERM-Bereinigung
