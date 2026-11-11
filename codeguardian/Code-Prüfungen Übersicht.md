---
typ: dashboard
projekt: codeguardian
datum: 2026-11-11T00:00:00
tags: [codeguardian, dashboard, uebersicht]
---

# Code-Prüfungen Übersicht

## Zusammenfassung

```dataview
TABLE status, count(projekt) AS pruefungen
FROM "codeguardian" WHERE typ = "code-pruefung"
GROUP BY status
```

## Letzte Prüfungen

```dataview
TABLE projekt, status, abweichungen, durchlauf, datum
FROM "codeguardian" WHERE typ = "code-pruefung"
SORT datum DESC
LIMIT 20
```

## Filter: nach Projekt

Setze im Frontmatter einen `filter_projekt`-Wert (z.B. `filter_projekt: ai-content-studio`), um alle Tabellen auf dieses Projekt zu filtern.

```dataview
TABLE projekt, status, abweichungen, durchlauf, datum
FROM "codeguardian" WHERE typ = "code-pruefung"
WHERE projekt = {{ this.filter_projekt }}
SORT datum DESC
```

## Filter: nach Status

Setze im Frontmatter einen `filter_status`-Wert (z.B. `filter_status: bestanden`), um nur Prüfungen dieses Status anzuzeigen.

```dataview
TABLE projekt, status, abweichungen, durchlauf, datum
FROM "codeguardian" WHERE typ = "code-pruefung"
WHERE status = {{ this.filter_status }}
SORT datum DESC
```

## Filter: nach Durchlauf

Setze im Frontmatter einen `filter_durchlauf`-Wert (z.B. `filter_durchlauf: 1`), um nur einen bestimmten Durchlauf anzuzeigen.

```dataview
TABLE projekt, status, abweichungen, durchlauf, datum
FROM "codeguardian" WHERE typ = "code-pruefung"
WHERE durchlauf = {{ this.filter_durchlauf }}
SORT datum DESC
```

## Abweichungen-Trend (letzte 10 Prüfungen)

```dataview
TABLE datum, projekt, abweichungen
FROM "codeguardian" WHERE typ = "code-pruefung"
SORT datum DESC
LIMIT 10
```

## Offene Abweichungen

```dataview
LIST abweichungen
FROM "codeguardian" WHERE typ = "code-pruefung"
WHERE status = "abweichungen"
SORT datum DESC
```

## Abweichungen pro Projekt

```dataview
TABLE projekt, sum(abweichungen) AS gesamt_abweichungen
FROM "codeguardian" WHERE typ = "code-pruefung"
GROUP BY projekt
SORT gesamt_abweichungen DESC
```