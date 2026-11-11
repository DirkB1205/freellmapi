#!/usr/bin/env python3
"""
csv2json — Konvertiert CSV-Dateien zu JSON-Output.

CLI-Schnittstelle mit Typer-ähnlichem CLI mit argparse.

# Schritt 1: CSV-Datei lesen und parsen
# Schritt 2: Zeilen in Dictionary-Objekte konvertieren
# Schritt 3: JSON-Output mit formatierter Ausgabe

>>> import json
>>> csv_data = 'name,alter,stadt\\nAlice,30,Berlin\\nBob,25,München'
>>> result = csv_to_json(csv_data)
>>> len(result)
2
>>> result[0]['name']
'Alice'
>>> result[1]['alter']
'25'
"""

import csv
import json
import sys
import io
import argparse
from typing import Any, Dict, List


def csv_to_json(csv_string: str, delimiter: str = ',') -> List[Dict[str, str]]:
    """
    Konvertiert CSV-Text in eine Liste von Dictionaries.

    >>> csv_to_json('a,b\\n1,2')
    [{'a': '1', 'b': '2'}]
    >>> csv_to_json('')
    []
    >>> csv_to_json('x\\n1')
    [{'x': '1'}]
    """
    # Schritt 1: CSV-String in Reader wandeln
    reader = csv.DictReader(io.StringIO(csv_string.strip()), delimiter=delimiter)
    # Schritt 2: Zeilen sammeln
    return [dict(row) for row in reader if row]


def infer_types(value: str) -> Any:
    """
    Versucht, einen String in int, float oder bool zu konvertieren.

    >>> infer_types('42')
    42
    >>> infer_types('3.14')
    3.14
    >>> infer_types('true')
    True
    >>> infer_types('false')
    False
    >>> infer_types('hello')
    'hello'
    """
    # Schritt 1: Integer prüfen
    try:
        return int(value)
    except ValueError:
        pass
    # Schritt 2: Float prüfen
    try:
        return float(value)
    except ValueError:
        pass
    # Schritt 3: Boolean prüfen
    if value.lower() == 'true':
        return True
    if value.lower() == 'false':
        return False
    # Schritt 4: String zurückgeben
    return value


def convert_with_types(data: List[Dict[str, str]]) -> List[Dict[str, Any]]:
    """
    Wendet infer_types auf alle Werte an.

    >>> convert_with_types([{'a': '1', 'b': 'text'}])
    [{'a': 1, 'b': 'text'}]
    >>> convert_with_types([])
    []
    """
    # Schritt 1: Jede Zeile durchiterieren
    result = []
    for row in data:
        converted = {key: infer_types(value) for key, value in row.items()}
        result.append(converted)
    return result


def main(argv=None):
    """
    CLI-Einstiegspunkt für csv2json.

    Usage:
        python csv2json.py input.csv
        python csv2json.py input.csv --types
        python csv2json.py input.csv --indent 2

    Doctests sind im Modul-Level, nicht hier (CLI-Funktion mit Side-Effects).
    """
    # Schritt 1: Argumente parsen
    parser = argparse.ArgumentParser(description='CSV zu JSON konvertieren')
    parser.add_argument('input', help='Pfad zur CSV-Datei')
    parser.add_argument('--types', action='store_true', help='Automatische Typ-Konvertierung')
    parser.add_argument('--indent', type=int, default=2, help='JSON-Einrückung (Standard: 2)')
    parser.add_argument('--delimiter', default=',', help='CSV-Delimiter (Standard: ,)')
    args = parser.parse_args(argv)

    # Schritt 2: Datei lesen
    try:
        with open(args.input, 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        print(f'FEHLER: Datei nicht gefunden: {args.input}', file=sys.stderr)
        sys.exit(1)
    except PermissionError:
        print(f'FEHLER: Keine Berechtigung: {args.input}', file=sys.stderr)
        sys.exit(1)

    # Schritt 3: CSV parsen
    data = csv_to_json(content, delimiter=args.delimiter)
    if not data:
        print('[]')
        return '[]'

    # Schritt 4: Typ-Konvertierung (optional)
    if args.types:
        data = convert_with_types(data)

    # Schritt 5: JSON ausgeben
    output = json.dumps(data, indent=args.indent, ensure_ascii=False)
    print(output)
    return output


if __name__ == '__main__':
    main()
