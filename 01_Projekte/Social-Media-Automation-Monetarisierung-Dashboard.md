---
tags: [projekt, sozial, monetarisierung, dashboard, social-media]
created: 2026-09-16
status: aktiv
related: "[[Projekte/STAND-2026-09-17_tiktok-app-setup]]"
migrated_from: "AI-System 3.0 / Projekte/Social-Media-Automation-Monetarisierung-Dashboard.md"
---

# Dossier: Monetarisierung + Metriken-Dashboard (social-media-automation)

## 1. Monetarisierung je Plattform (Stand Sep 2026)

### YouTube Shorts
- Partnerprogramm (YPP): **1.000 Abonnenten + 10 Mio. Shorts-Views in 90 Tagen** ODER 1.000 Subs + 4.000 Watch-Stunden (Long-Form).
- Shorts Ads Revenue Sharing aktiv; eigene Analytics-Metrik `estimatedRevenue` via API.
- **Wichtigste Einnahmequelle für reine Shorts-Pipeline.**

### TikTok
- Creator Rewards Program (Nachfolger Creator Fund, seit 03/2024):
  - **Zahlt NUR für Videos ≥ 1 Minute** ("qualified views": ≥5s Watch-Time, im FYP).
  - RPM ~$0,40–1,00/1.000 qualifizierte Views (Schätzung, nicht offiziell).
  - Auszahlung am 15. des Monats, Mindestbetrag $50.
- ⚠️ **Reine Sub-60s-Shorts ernten NICHT auf TikTok.** Strategische Konsequenz:
  entweder TikTok-Shorts nur als Reichweiten-Booster (ohne Reward) nutzen, oder
  ≥60s-Variante bauen (Long-Form/YT). Oder TikTok-Seite in Kauf nehmen.
- Keine Einnahmen-API: Rewards-Details = "Confidential Information" (nur privat).

### Instagram/Meta
- Reels Play Bonus: für Neuzugänge **seit März 2025 eingestellt**. Ersatz: Revenue Share Ads (nur in-App einsehbar).
- **Keine Meta-API für Einnahmen** ("never exposed on any Instagram surface").
- Instagram = Reichweiten-/Marken-Building, nicht primär Geld (in DE).

---

## 2. Bezahlte Werbung einbinden – Optionen (legal)

| Kanal | Legalität | Kennzeichnung | Ertrag |
|---|---|---|---|
| **Sponsoring / Brand Deals** | Legal | Pflicht nach **§6 TMG / MStV** ("Werbung" / "Anzeige" im ersten Drittel) | Direktvertrag (CPM/Pauschal) |
| **Affiliate Marketing** | Legal | Link im Profil / Description als Werbung kennzeichnen | Provision per Sale (z.B. Amazon, Digistore24) |
| **Eigene Produkte / Services** | Legal | Kein Werbekennzeichnungs-Zwang für Eigenwerbung | Direktumsatz |

---

## 3. Posting-Module & API-Integrationen (`src/posting/`)

- **YouTube** (`src/posting/youtube.py`): OAuth 2.0 + Resumable Upload (`videos.insert`). Quota-schonend (ca. 1.600 Units pro Upload).
- **TikTok** (`src/posting/tiktok.py`): Content Posting API (`creator_info` → `video/init` → `PUT` → `status/fetch`). Unaudited Apps posten standardmäßig privat (`PUBLIC_TO_EVERYONE` nach Audit).
- **Instagram** (`src/posting/instagram.py`): Container REELS → Status-Polling → `media_publish` (benötigt öffentliche Video-URL). Kein Direkt-Upload, JPEG empfohlen (PNG oft abgelehnt).
- **X / Twitter** (`src/posting/x_twitter.py`): OAuth 1.0a zwingend für Media-Upload (Bearer-Token reicht nicht). Pay-per-Use ($0,015/Post, $0,20 mit URL).

---

## 4. Metriken-Dashboard & Pipeline-Status (`src/metrics/`, Port 8600)

- **FastAPI-Backend** auf Port `8600` mit SQLite-Datenbank (`metrics.db`).
- Erfasst Performance-Metriken (Views, Likes, Shares, geschätzter Umsatz).
- Automatisiertes Reporting und Live-Status für alle aktiven Plattform-Pipelines.
- Aufruf: `.venv\Scripts\python -m uvicorn src.metrics.app:app --port 8600`

---

## 5. Compliance & EU AI Act (Art. 50)

- Alle generierten Inhalte tragen maschinenlesbare **C2PA-Metadaten** (Signierung über `c2patool` und lokales Creator-Zertifikat unter `config/certs/`).
- Einhaltung von COPPA 2.0 (Kinderschutz) und Plattform-ToS (Dedup-Hash in `BasePoster` gegen Duplicate Content).
