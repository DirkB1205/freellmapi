---
typ: projekt-dossier
projekt: video-features-roadmap
datum: 2026-11-12
status: in-progress
owner: AI-System 4.0 Core-Team
prioritaet: hoch
tags: [video, features, roadmaps, implementation, tiktok, telegram]
---

# Video-Features Roadmap — Projekt-Dossier

## Ownership & Verantwortung

| Rolle | Agent / Person | Aufgabe |
|-------|----------------|---------|
| **Product Owner** | Boss | Priorisierung, Freigabe Meilensteine |
| **Implementation Lead** | Builder-Agent | Code-Implementierung, Doctests |
| **Review Lead** | Reviewer-Agent (ollama/codellama:latest) | CodeGuardian-Prüfung, Abweichungs-Tracking |
| **Pipeline-Owner** | ai-system-v4 (index.mjs) | Media-Pipeline, Autoprozessierung |

**Gültig ab:** 2026-11-12  
**Letzte Aktualisierung:** 2026-11-12

---

## 1. Ausgangslage

### 1.1 Analysierte Videos

| Quelle | Anzahl | Status | Dokumentation |
|--------|--------|--------|---------------|
| Telegram | 19 | ✅ analysiert (6 geparkt) | `code/OMNI-INBOX.md`, `01_Projekte/STATUS-AKTUELL-2026-11-08.md` |
| TikTok | 36 | ✅ analysiert | `ideen/gesamtsummary.md`, `_video-meta.csv`, `_video-list.csv` |

### 1.2 Bereits Implementiert

- ✅ **Telegram-Video-Autoprozessierung** (Pipeline in `Projekte/ai-system-v4/index.mjs`)
  - Status: Review bestanden (CodeGuardian-Note vorhanden)
  - Funktion: Automatisches Herunterladen, Transkribieren, Analysieren von Telegram-Videos

### 1.3 GELÖST — 8 geparkte TikTok-Videos (2026-11-12)

8 geparkte `vm.tiktok.com`-Links (Quelle: `code/OMNI-INBOX.md`) wurden per
`requests` + Browser-UA + JSON-LD aufgelöst und geparst — **ohne yt-dlp**
(TikTok blockiert yt-dlp; nur kostenlose Open-Source-Stack).

| Video-ID | Autor | Typ | Inhalt (gekürzt) |
|----------|-------|-----|------------------|
| `ZGdXAoVWF` | @sebastiankauffmann | Video | Tag 276 – Claude nie wieder voll laufen (Link: platz.skaile.de) |
| `ZGdXDAmJY` | @niklas_volland | Video | 5 KI-Tools kostenlos Nov 2026 (Duck.ai, LM Studio, Qwen, Gemini Notebook, Google AI Studio) |
| `ZGdXAKBsq` | @rockai35 | Video | 5 MCPs für Claude Code (Cloudflare, Sentry, Playwright, Linear, Remotion) |
| `ZGdXD8or8` | @iamvishalpunia | Video | 33 Skills für Claude Code / Business-Ansatz |
| `ZGdXDSKoD` | @robincsipke | Video | Claude Academy – kostenlose Kurse von Anthropic |
| `ZGdXDNavu` | @alan.buildz | Video | Coding-Tutorial (Link: alanbuildz.com) |
| `ZGdXDkuoT` | @leo.kiedemann | Video | QMD – semantische Suche lokal (GitHub: `tobi/qmd`) |
| `ZGdXDNret` | @your.aimentor | Foto | — (kein Titel im JSON-LD) |

- Status: ✅ gelöst — Metadaten (final-URL, Titel, Autor, Typ) extrahiert
- Parsing-Script: `.temp/parse_tiktok_v2.py`
- Vollständige Metadaten (inkl. finaler URLs): `.temp/tiktok_parsed.json`

---

## 2. Implementierungs-Backlog (priorisiert)

### Priorität A — Kern-Features (Q4 2026)

| ID | Feature | Quelle | Aufwand | Status |
|----|---------|--------|---------|--------|
| **VF-001** | **Video-Content-Extraktion & Strukturierung** | TikTok-Analyse (36 Videos) | M | 📋 geplant |
| **VF-002** | **Kommentar-Analyse Pipeline** | Telegram + TikTok | S | 📋 geplant |
| **VF-003** | **YouTube-Vergleichs-Analyse** | TikTok-Analyse | M | 📋 geplant |
| **VF-004** | **Auto-Tagging für Video-Inhalte** | Gesamtsummary | S | 📋 geplant |

### Priorität B — Erweiterte Features (Q1 2027)

| ID | Feature | Quelle | Aufwand | Status |
|----|---------|--------|---------|--------|
| **VF-005** | **Trend-Erkennung über Video-Serien** | TikTok-Musteranalyse | L | 🔒 backlog |
| **VF-006** | **Content-Duplikation-Erkennung** | Telegram + TikTok | M | 🔒 backlog |
| **VF-007** | **Multi-Platform-Video-Aggregation** | Pipeline-Erweiterung | L | 🔒 backlog |

### Priorität C — Experimentell (TBD)

| ID | Feature | Quelle | Aufwand | Status |
|----|---------|--------|---------|--------|
| **VF-008** | **Auto-Generierte Zusammenfassungen** | Gesamtsummary | M | 🔒 backlog |
| **VF-009** | **Visuelle Thumbnail-Analyse** | TikTok-Metadaten | XL | 🔒 backlog |

---

## 3. Meilenstein-Planung

### Meilenstein 1 — Basis-Pipeline (Q4 2026, Woche 46-48)

**Ziel:** Kern-Features VF-001 bis VF-004 produktionsreif

- [ ] **Woche 46**: VF-001 Implementierung (Video-Content-Extraktion)
  - Doctests: ≥3 pro öffentlicher Funktion
  - Review: CodeGuardian-Note erforderlich
- [ ] **Woche 47**: VF-002 + VF-003 Implementierung
  - Integration in bestehende Pipeline
  - Performance-Test mit 50+ Videos
- [ ] **Woche 48**: VF-004 + Integrationstests
  - E2E-Test: Telegram → Analyse → Tagging
  - Review-Gate: Alle Abweichungen dokumentiert

**Definition of Done:**
- ✅ Alle Funktionen mit Doctests (Happy-Path + Edge-Case)
- ✅ CodeGuardian-Review bestanden (status: bestanden)
- ✅ E2E-Test grün (50+ Videos, keine Memory-Leaks)
- ✅ Dokumentation in Vault (`04_Learnings/`)

### Meilenstein 2 — Erweiterte Analyse (Q1 2027, Woche 1-4)

**Ziel:** VF-005 bis VF-007 implementiert

- [ ] Trend-Erkennung (VF-005)
- [ ] Duplikation-Erkennung (VF-006)
- [ ] Multi-Platform-Aggregation (VF-007)

### Meilenstein 3 — Experimentelle Features (TBD)

**Ziel:** VF-008 + VF-009 nach Boss-Freigabe

---

## 4. Technische Architektur

### 4.1 Pipeline-Übersicht

```
[Video-Quelle] → [Downloader] → [Transkription] → [Analyse] → [Tagging] → [Vault]
     │               │              │               │          │         │
  Telegram        ffmpeg         Whisper        LLM-Call    NLP     Obsidian
  TikTok          yt-dlp         (lokal)     (OmniRoute)  (lokal)   (.md)
```

### 4.2 Dateistruktur

```
01_Projekte/Video-Features-Roadmap/
├── Video-Features-Roadmap.md        # Dieses Dossier
├── IMPLEMENTATION-STATUS.md         # Laufender Status (wöchentlich aktualisiert)
├── ARCHITECTURE.md                  # Technische Details, Schnittstellen
└── REVIEWS/                         # CodeGuardian-Review-Notes
    └── <datum>_<feature>.md
```

### 4.3 Abhängigkeiten

| Dependency | Version | Zweck |
|------------|---------|-------|
| `ffmpeg` | ≥6.0 | Video/Audio-Extraktion |
| `yt-dlp` | latest | TikTok/YouTube-Download |
| `whisper.cpp` | latest | Lokale Transkription |
| `OmniRoute` | lokal | LLM-Analyse (OmniRoute-Provider) |

---

## 5. Risk & Issues

| Risiko | Wahrscheinlichkeit | Auswirkung | Mitigation |
|--------|-------------------|------------|------------|
| **API-Rate-Limits (TikTok/Telegram)** | Mittel | Hoch | Caching, Retry-Logic, Fallback auf lokale Quellen |
| **Transkriptions-Qualität** | Hoch | Mittel | Whisper.cpp mit VAD, manuelle Nachkorrektur |
| **LLM-Halluzination bei Analyse** | Mittel | Mittel | Reviewer-Agent mit Fact-Checking, Vault-Abgleich |
| ~~Geparkte Tasks (8 Videos)~~ | — | — | ✅ GELÖST 2026-11-12: Metadaten extrahiert (`.temp/tiktok_parsed.json`) |

---

## 6. Verknüpfungen

- **Quelldokumente:**
  - `ideen/gesamtsummary.md` — TikTok-Analyse (36 Videos)
  - `01_Projekte/STATUS-AKTUELL-2026-11-08.md` — Vollständige Analyse
  - `OMNI-INBOX.md` — Task-Status, geparkte Videos
  - `code/OMNI-INBOX.md` — Telegram-Message-History

- **Implementierte Pipeline:**
  - `Projekte/ai-system-v4/index.mjs` — Autoprozessierung

- **CodeGuardian-Audits:**
  - `codeguardian/2026-11-11_skill_audit_Lauf3.md` — Skill-Audit
  - `04_Learnings/CodeGuardianAudit/CodeGuardianAudit-2026-11-08-VideoAnalysis.md` — Video-Analyse-Audit

- **Fehler & Learnings:**
  - `05_Fehler/` — Offene Fehler (geparkte Tasks)
  - `04_Learnings/` — Dokumentierte Learnings aus Implementation

---

## 7. Nächste Schritte

1. **Boss-Freigabe:** Roadmap priorisierung bestätigen (Priorität A: VF-001 bis VF-004)
2. ~~**Geparkte Tasks:**~~ ✅ gelöst — Metadaten der 8 TikTok-Videos in `.temp/tiktok_parsed.json` (Sektion 1.3)
3. **Woche 46 Start:** VF-001 Implementation (Video-Content-Extraktion)
4. **Wöchentliches Update:** `IMPLEMENTATION-STATUS.md` aktualisieren (jeden Freitag)

---

## 8. Change-Log

| Datum | Änderung | Autor |
|-------|----------|-------|
| 2026-11-12 | Ersterstellung Dossier | Builder-Agent |
| 2026-11-12 | Ownership definiert, Roadmap initialisiert | Builder-Agent |
| 2026-11-12 | 8 geparkte TikTok-Videos aufgelöst: Metadaten extrahiert (Sektion 1.3, `.temp/tiktok_parsed.json`) | Builder-Agent |

---

**Status:** 📋 in-progress  
**Nächster Review:** 2026-11-19 (Woche 47)
