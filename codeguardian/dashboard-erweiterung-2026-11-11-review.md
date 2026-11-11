---
typ: code-pruefung
projekt: codeguardian
datum: 2026-11-11T00:00:00
status: bestanden
abweichungen: 0
durchlauf: 2
dateien:
  - codeguardian/Code-Prüfungen Übersicht.md
tags: [codeguardian, dashboard, dataview, review]
---

# Prüfung Codeguardian Dashboard — 2026-11-11 — Lauf 2

## Ergebnis

**Bestanden.** Dashboard-Erweiterung (Abweichungen-Trend + Filter) implementiert und Dataview-kompatibel geprüft.

## Schritt-Abgleich

| Schritt | Erwartet | Gefunden | Status |
|---------|----------|----------|--------|
| 1: Zusammenfassung | `TABLE status, count(projekt) ... GROUP BY status` | ✅ | OK |
| 2: Letzte Prüfungen | `TABLE ... LIMIT 20 SORT datum DESC` | ✅ | OK |
| 3: Filter nach Projekt | `WHERE projekt = {{ this.filter_projekt }}` | ✅ | OK |
| 4: Filter nach Status | `WHERE status = {{ this.filter_status }}` | ✅ | OK |
| 5: Filter nach Durchlauf | `WHERE durchlauf = {{ this.filter_durchlauf }}` | ✅ | OK |
| 6: Abweichungen-Trend | `TABLE datum, projekt, abweichungen ... LIMIT 10` | ✅ | OK |
| 7: Offene Abweichungen | `LIST abweichungen WHERE status = "abweichungen"` | ✅ | OK |
| 8: Abweichungen pro Projekt | `TABLE projekt, sum(abweichungen) ... GROUP BY projekt` | ✅ | OK |

## Input/Output

**Dataview-Struktur:**
- 8 Dataview-Blöcke, alle auf Tag `#code-pruefung` filternd
- Frontmatter-Felder der Review-Notes (`projekt`, `status`, `abweichungen`, `durchlauf`, `datum`) werden genutzt
- System-Verifikationen (`typ: system-verifikation`) sind nicht gelistet (kein Tag `code-pruefung`)
- Keine Auswirkungen auf bestehende Tools/services

## verify.sh

- Exit-Code: 0 (143 Tests bestanden)
- Keine neuen Dateien mit Fehlern
- Dashboard-Datei ist rein statisch (kein Code, keine Ausführung)

## Verknüpfungen

- Review-Notes: `codeguardian/hardware-advisor-2026-11-10-review.md`, `codeguardian/PRUEFUNG-json2csv-2026-11-10T22-58-00.md`, `codeguardian/PRUEFUNG-nvidia-provider-minute-cap-2026-11-10T00-00-00.md`
- System-Verifikation: `codeguardian/system-verifikation-2026-11-10.md`
- Task: OMNI-INBOX.md (Eintrag 2026-11-11 Dashboard-Erweiterung)