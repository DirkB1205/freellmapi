---
tags: [ADR, ECC, Architektur]
created: 2026-11-07
status: accepted
---

# ADR-2026-11-07 — ECC als Betriebsschicht für OpenCode

## Kontext

AI-System 4.0 benötigt eine standardisierte Agenten-Plattform. Die manuell erstellten 12 Agenten-Definitionen reichten nicht aus – sie fehlten Spezialisierung, Wartbarkeit und ein Ökosystem.

## Alternativen

1. **Weiterhin manuelle Agenten-Definitionen:** Keine Skalierung, inkonsistente Qualität.
2. **ECC (affaan-m/ECC):** 71 vordefinierte Agenten, 332 Skills, 104 Commands, MIT-Lizenz, aktiver Maintainer, native OpenCode-Unterstützung.
3. **Eigenes Framework bauen:** Hoher Aufwand, spätere Integration von ECC ohnehin nötig.

## Entscheidung

ECC wird als Betriebsschicht für OpenCode gewählt. Die Installation erfolgt über den offiziellen Installer mit `--no-hooks` (Hooks nur nach expliziter Zustimmung). Die 12 manuell erstellten Agenten werden durch ECCs 71 Agenten ersetzt. Zwei zusätzliche System-Agenten (Security-Agent, Coding-Guideline-Agent) werden ergänzt.

## Konsequenzen

- **Positiv:** sofortige Nutzung von 71 spezialisierten Agenten, 332 Skills, standardisierte Workflows.
- **Negativ:** Abhängigkeit von ECC-Updates; neue ECC-Versionen müssen getestet werden.
- **Neutral:** Die Vault-Struktur (11 Verzeichnisse) bleibt unberührt.

## Gegenmaßnahmen

ECC-Version pinning (`02_ECC/` als gechecktes Repo), Security-Agent prüft alle ECC-Updates auf CVEs vor Installation.