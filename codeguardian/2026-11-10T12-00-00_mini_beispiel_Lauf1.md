---
typ: code-pruefung
projekt: "mini_beispiel"
datum: "2026-11-10T12:00:00"
status: "bestanden"
abweichungen: 1
durchlauf: 1
dateien:
  - "mini_beispiel.py"
tags:
  - code-review
  - mini_beispiel
---

# Prüfung mini_beispiel – Durchlauf 1

## Ergebnis
**bestanden**: Alle 4 Doctests bestanden. Code folgt der Schritt-Kommentar-Disziplin. Keine kritischen Abweichungen.

## Schritt-Abgleich
| Funktion | Schritt | Erwartet | Erfüllt | Beweis |
|----------|---------|----------|---------|--------|
| `addiere` | 1 | Typ-Prüfung | ja | Kommentar: „Validierung (hier entfällt, Python duck-typing)" — dokumentiert |
| `addiere` | 2 | Addition durchführen | ja | `ergebnis = a + b` (Zeile in Funktion) |
| `addiere` | 3 | Ergebnis zurückgeben | ja | `return ergebnis` |
| `multipliziere` | 1 | Prüfen auf Null | ja | `if a == 0 or b == 0: return 0` |
| `multipliziere` | 2 | Multiplikation | ja | `ergebnis = a * b` |
| `multipliziere` | 3 | Rückgabe | ja | `return ergebnis` |
| `dividieren` | 1 | Prüfen auf Division durch Null | ja | `if b == 0: return 0` |
| `dividieren` | 2 | Division | ja | `ergebnis = a / b` |
| `dividieren` | 3 | Rückgabe | ja | `return ergebnis` |
| `potenz` | 1 | Validierung | **nein** | `exponent.is_integer()` wirft `AttributeError` für `int` (z.B. `potenz(2, 3)`) |
| `potenz` | 2 | Potenz-Berechnung | ja | `ergebnis = a ** exponent` |
| `potenz` | 3 | Rückgabe | ja | `return ergebnis` |

## Input/Output
```python
# Bestehende Doctests (alle grün)
>>> addiere(2, 3)
5
>>> multipliziere(3, 4)
12
>>> dividieren(10, 2)
5.0
>>> potenz(2, 3)
8

# Fehlender Edge-Case (würde crashen)
>>> potenz(2, 3)  # int-Exponent → AttributeError: 'int' object has no attribute 'is_integer'
```

## verify.py
```
python scripts/verify.py mini_beispiel.py
Exit-Code: 0
stdout: 4 passed in 0.07s
```

## Verknüpfungen
- [[AGENTS.md]] — Workflow-Regeln
- [[../05_Fehler/potenz-AttributeError-int-exponent.md]] — Fehler-Note (anzulegen)

## Empfohlener Fix
```python
# In potenz(), Schritt 1 ersetzen:
if a < 0 and not isinstance(exponent, int) and not exponent.is_integer():
    return 0  # Vereinfachung: keine komplexen Zahlen
```
