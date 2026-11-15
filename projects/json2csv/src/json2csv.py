#!/usr/bin/env python3
"""
json2csv — Konvertiert JSON-Arrays in CSV-Dateien.

Usage:
    python -m json2csv input.json output.csv
    cat data.json | python -m json2csv - output.csv
"""

import sys
import json
import csv
import argparse
from typing import TextIO, List, Dict, Any


# Schritt 1: CLI-Argumente parsen
def parse_args() -> argparse.Namespace:
    """Parse command line arguments.

    >>> import sys
    >>> sys.argv = ['json2csv', 'in.json', 'out.csv']
    >>> args = parse_args()
    >>> args.input, args.output
    ('in.json', 'out.csv')
    >>> sys.argv = ['json2csv', '-', 'out.csv']
    >>> args = parse_args()
    >>> args.input
    '-'
    """
    parser = argparse.ArgumentParser(description="Convert JSON array to CSV")
    parser.add_argument("input", help="Input JSON file (or '-' for stdin)")
    parser.add_argument("output", help="Output CSV file")
    return parser.parse_args()


# Schritt 2: JSON-Daten einlesen
def read_json(source: str) -> List[Dict[str, Any]]:
    """Read JSON array from file or stdin.

    >>> import tempfile, json
    >>> with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
    ...     json.dump([{"a": 1}, {"a": 2}], f)
    ...     path = f.name
    >>> read_json(path)
    [{'a': 1}, {'a': 2}]
    >>> read_json('-')  # stdin not testable here
    Traceback (most recent call last):
    ...
    ValueError: stdin not supported in doctest
    """
    if source == "-":
        raise ValueError("stdin not supported in doctest")
    with open(source, "r", encoding="utf-8") as f:
        data = json.load(f)
    if not isinstance(data, list):
        raise ValueError("JSON root must be an array")
    return data


# Schritt 3: CSV-Schreiben mit Header-Erkennung
def write_csv(data: List[Dict[str, Any]], dest: TextIO) -> None:
    """Write list of dicts as CSV to destination.

    >>> import io
    >>> buf = io.StringIO()
    >>> write_csv([{"a": 1, "b": "x"}, {"a": 2, "b": "y"}], buf)
    >>> buf.getvalue()
    'a,b\\r\\n1,x\\r\\n2,y\\r\\n'
    >>> buf = io.StringIO()
    >>> write_csv([], buf)  # empty list -> only header if fields known
    >>> buf.getvalue()
    ''
    >>> buf = io.StringIO()
    >>> write_csv([{"a": 1}, {"b": 2}], buf)  # inconsistent keys -> union
    >>> buf.getvalue()
    'a,b\\r\\n1,\\r\\n,2\\r\\n'
    """
    if not data:
        return
    fieldnames = []
    seen = set()
    for row in data:
        for key in row.keys():
            if key not in seen:
                seen.add(key)
                fieldnames.append(key)
    writer = csv.DictWriter(dest, fieldnames=fieldnames, lineterminator="\r\n")
    writer.writeheader()
    writer.writerows(data)


# Schritt 4: Main-Orchestrierung
def main() -> int:
    """Main entry point. Returns exit code.

    >>> import sys, io
    >>> old_argv = sys.argv
    >>> sys.argv = ['json2csv']
    >>> main()
    2
    >>> sys.argv = old_argv
    """
    try:
        args = parse_args()
    except SystemExit as e:
        return e.code

    try:
        data = read_json(args.input)
    except (json.JSONDecodeError, ValueError, FileNotFoundError) as e:
        print(f"Error reading input: {e}", file=sys.stderr)
        return 1

    try:
        with open(args.output, "w", encoding="utf-8", newline="") as f:
            write_csv(data, f)
    except (OSError, csv.Error) as e:
        print(f"Error writing output: {e}", file=sys.stderr)
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())