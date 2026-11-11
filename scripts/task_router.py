#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Task-Router für AI-System 4.0 Codeguardian-Pipeline
Mappt Aufgaben-Bereiche und Beschreibungen auf Skills oder Agenten.
"""

from typing import Dict, Any

def route_task(task: Dict[str, Any]) -> Dict[str, str]:
    """
    Ermittelt anhand von Bereich und Beschreibung den passenden Skill oder Agenten.
    
    >>> route_task({'area': 'Codeguardian-Pipeline', 'description': 'verify.sh fixen'})
    {'handler': 'skill', 'target': 'debug-loop', 'action': 'verify'}
    >>> route_task({'area': 'AI-System V4', 'description': '/health-Endpoint implementieren'})
    {'handler': 'skill', 'target': 'backend-patterns', 'action': 'implement'}
    >>> route_task({'area': 'Unbekannt', 'description': 'irgendwas tun'})
    {'handler': 'agent', 'target': 'builder', 'action': 'default'}
    """
    # Schritt 1: Bereich und Beschreibung normalisieren
    area = task.get('area', '').lower()
    desc = task.get('description', '').lower()
    
    # Schritt 2: Routing-Regeln anwenden
    if 'codeguardian' in area or 'autonomie' in area or 'verify' in desc:
        return {'handler': 'skill', 'target': 'debug-loop', 'action': 'verify'}
    elif 'v4' in area or 'endpoint' in desc or 'api' in desc:
        return {'handler': 'skill', 'target': 'backend-patterns', 'action': 'implement'}
    elif 'obsidian' in area or 'vault' in desc:
        return {'handler': 'skill', 'target': 'obsidian-brain', 'action': 'sync'}
    else:
        return {'handler': 'agent', 'target': 'builder', 'action': 'default'}

if __name__ == '__main__':
    import doctest
    doctest.testmod()
