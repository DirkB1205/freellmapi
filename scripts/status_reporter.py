#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Status-Reporter für AI-System 4.0 Codeguardian-Pipeline
Aktualisiert den Task-Status in OMNI-INBOX.md und schreibt Review-Noten.
"""

import re
from pathlib import Path
from typing import Dict, Any

def update_inbox_status(
    inbox_path: str,
    original_line: str,
    new_status: str,
    result_note: str
) -> str:
    """
    Ersetzt eine Checkbox in der Inbox-Datei und gibt den neuen Inhalt zurück.
    
    >>> update_inbox_status('test.md', '- [ ] Test', 'completed', 'note.md')
    '- [x] Test — Ergebnis: note.md'
    >>> update_inbox_status('test.md', '- [ ] Test', 'in-progress', '')
    '- [in-progress] Test'
    """
    if new_status == 'completed':
        new_line = original_line.replace('[ ]', '[x]')
        if result_note:
            if 'Ergebnis:' not in new_line:
                new_line += f" — Ergebnis: {result_note}"
        return new_line
    elif new_status == 'in-progress':
        return original_line.replace('[ ]', '[in-progress]')
    return original_line


def write_result_to_inbox(
    inbox_path: str,
    task_line: str,
    status: str,
    review_note_path: str = ""
) -> bool:
    """
    Aktualisiert die Status-Zeile in der Inbox-Datei und speichert das Ergebnis.
    Gibt True zurück, wenn erfolgreich geschrieben wurde.
    """
    # Schritt 1: Inbox-Datei einlesen
    inbox = Path(inbox_path)
    if not inbox.exists():
        return False
    
    content = inbox.read_text(encoding='utf-8')
    
    # Schritt 2: Neue Zeile erzeugen
    new_line = update_inbox_status(inbox_path, task_line, status, review_note_path)
    
    # Schritt 3: Datei aktualisieren
    content = content.replace(task_line, new_line)
    inbox.write_text(content, encoding='utf-8')
    
    return True


def create_review_note(
    note_dir: str,
    task: Dict[str, Any],
    result: str,
    status: str
) -> str:
    """
    Erstellt eine kurze Review-Note im codeguardian-Verzeichnis und gibt den Pfad zurück.
    
    >>> import tempfile
    >>> td = tempfile.mkdtemp()
    >>> task = {'area': 'Test', 'description': 'Testaufgabe'}
    >>> path = create_review_note(td, task, 'OK', 'bestanden')
    >>> 'codeguardian' in path
    True
    """
    from datetime import datetime
    note_dir_path = Path(note_dir)
    # codeguardian-Unterordner anlegen
    note_dir_path = note_dir_path / "codeguardian"
    note_dir_path.mkdir(parents=True, exist_ok=True)

    filename = f"PRUEFUNG-{task['area'].replace(' ', '-').replace('/', '-')}-{datetime.now().strftime('%Y-%m-%d')}.md"
    note_path = note_dir_path / filename
    
    # Schritt 1: Note-Inhalt generieren
    content = f"""---
typ: code-pruefung
projekt: {task['area']}
datum: {datetime.now().strftime('%Y-%m-%dT%H:%M:%S')}
status: {status}
abweichungen: 0
dateien:
  - scripts/inbox_parser.py
  - scripts/task_router.py
  - scripts/status_reporter.py
tags: [codeguardian, {task['area'].replace(' ', '-').replace('/', '-').lower()}, review]
---

# Pruefung {task['area']} - {datetime.now().strftime('%Y-%m-%d')}

## Ergebnis
{result}

## Task-Beschreibung
{task['description']}
"""
    
    note_path.write_text(content, encoding='utf-8')
    return str(note_path)


if __name__ == '__main__':
    import doctest
    doctest.testmod()
