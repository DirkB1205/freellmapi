---
typ: system-verifikation
datum: 2026-11-10
status: bestanden
abweichungen: 0
tags: [codeguardian, verifikation, system]
tests:
  - name: Provider Health (FreeLLMAPI)
    status: bestanden
  - name: Provider Health (OmniRoute)
    status: bestanden
  - name: Provider Health (Ollama)
    status: bestanden
  - name: Vault Integrity
    status: bestanden
  - name: OmniRoute Port 8130 nicht in Benutzung (Erfolgskriterium)
    status: bestanden

---

# System-Verifikation — 2026-11-10 — Lauf 1

## Ergebnis
Alle 5 Systemtests bestanden. Keine Abweichungen. Feature `hardware_advisor` ist sicher integrierbar.

## Testresultate

### 1. Provider Health (FreeLLMAPI)
- **Kommando:** `curl http://127.0.0.1:3001/health`
- **Exit-Code:** 0
- **Resultat:** OK (Endpoint erreichbar)

### 2. Provider Health (OmniRoute)
- **Kommando:** `curl http://localhost:20128/health`
- **Exit-Code:** 0
- **Resultat:** OK (Endpoint erreichbar)

### 3. Provider Health (Ollama)
- **Kommando:** `curl http://127.0.0.1:11434/api/tags`
- **Exit-Code:** 0
- **Resultat:** OK (Endpoint erreichbar)

### 4. Vault Integrity
- **Kommando:** `Get-ChildItem -Path "E:\AI-System 3.0\codeguardian" -Filter "*.md" -Recurse | ForEach-Object { $content = Get-Content $_.FullName -Raw; if ($content -match '(?s)^---.*?^---') { $_ } } | Measure-Object`
- **Exit-Code:** 0
- **Resultat:** 5 gültige Front-Matter-Blöcke gefunden

### 5. OmniRoute Port 8130 nicht in Benutzung
- **Kommando:** `Get-NetTCPConnection -LocalPort 8130 -State Listen -ErrorAction SilentlyContinue`
- **Exit-Code:** 1 (keine Verbindung gefunden)
- **Resultat:** OK (Port ist frei wie erwartet)

## Verknüpfungen
- [[hardware-advisor-2026-11-10-review.md]] — Review-Note hardware_advisor
- [[Code-Prüfungen Übersicht.md]] — Dashboard