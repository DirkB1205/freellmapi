#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Inbox-Parser für OMNI-INBOX.md
Liest offene Tasks (- [ ]) und extrahiert Metadaten, Bereich und Beschreibung.
"""

import re
from pathlib import Path
from typing import List, Dict, Any

def parse_inbox(inbox_path: str = "OMNI-INBOX.md") -> List[Dict[str, Any]]:
    """
    Liest die OMNI-INBOX.md und gibt eine Liste offener Tasks zurück.
    
    >>> import tempfile, os
    >>> tf = tempfile.NamedTemporaryFile(mode='w', delete=False, encoding='utf-8')
    >>> _ = tf.write("# Inbox\\n\\n- [ ] 2026-11-12: Testaufgabe — /test ausführen (Bereich: Test)\\n- [x] 2026-11-11: Erledigt\\n")
    >>> tf.close()
    >>> tasks = parse_inbox(tf.name)
    >>> os.unlink(tf.name)
    >>> len(tasks)
    2
    >>> tasks[0]['status']
    'open'
    >>> tasks[0]['area']
    'Test'
    """
    # Schritt 1: Datei einlesen
    path_obj = Path(inbox_path)
    if not path_obj.exists():
        return []
    
    content = path_obj.read_text(encoding='utf-8')
    tasks = []
    
    # Schritt 2: Zeilen parsen (suche - [ ] oder - [in-progress] oder - [x])
    pattern = re.compile(r'^- \s*\[\s*([^\]]*)\s*\]\s*(.*?)(?:\s*\(Bereich:\s*([^)]+)\))?\s*$', re.MULTILINE)
    
    for match in pattern.finditer(content):
        state_raw, description, area = match.groups()
        
        state_trimmed = state_raw.strip().lower()
        if state_trimmed == '':
            status = 'open'
        elif 'in-progress' in state_trimmed or state_trimmed == 'in-progress':
            status = 'in-progress'
        elif state_trimmed == 'x':
            status = 'completed'
        else:
            status = 'open'
            
        tasks.append({
            'raw_line': match.group(0),
            'status': status,
            'description': description.strip(),
            'area': area.strip() if area else 'Allgemein'
        })
        
    return tasks

if __name__ == '__main__':
    import doctest
    doctest.testmod()
