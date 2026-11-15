---
tags: [projekt, tiktok, website, dauerauftrag]
created: 2026-09-17
updated: 2026-09-17
status: PAUSIERT
related: "[[Projekte/Social-Media-Automation-Monetarisierung-Dashboard]]"
migrated_from: "AI-System 3.0 / Projekte/STAND-2026-09-17_tiktok-app-setup.md"
---

# Stand: TikTok App-Setup (Aktueller Fortschritt)

> **AUFGABE FÜR JEDE NEUE SESSION:** Erinnere den Boss an den Stand und die offenen Schritte unten („Erinnerung: TikTok-Setup").

## Status: ✅ Soweit erledigt

- ✅ Dev-Account + App angelegt (App-ID: `7686123298991802375`) — im Review-Status
- ✅ Website-Paket gebaut (`website/`): `index.html`, `privacy-policy.html`, `terms-of-service.html`, `callback.html`, `demo.html`
- ✅ **Demo-Video-Material fertig**: `docs/DEMO-VIDEO.md` (Regieanleitung + Storyboard für 3 Videos) + `website/demo.html` (Demo-UI mit allen TikTok-Pflicht-UX-Elementen: Creator-Info, Privacy-Dropdown ohne Default, Comment/Duet/Stitch-Toggles, Commercial Disclosure, Music-Usage-Consent, Preview, Publish-Status)
- ✅ `docs/TIKTOK-SETUP.md` erweitert: **Token-Refresh-Flow-Doku** (OAuth-URL → Code-Umtausch → Refresh) + **Demo-Video-Checkliste**
- ✅ Sandbox-Test-Skript gebaut: `tools/tiktok_oauth_flow.py` (step1/step2/refresh/auto; schreibt Tokens in .env; ruff sauber, 53 Tests weiterhin grün)
- ✅ 2 unabhängige KI-Audits (Security + Design) → **alle 8 kritischen Fixes angewendet** (CSRF-State, CSP, aria, Skip-Links, Kontrast, CTA, Media-Queries)
- ✅ Domain: `epower-world.com` gekauft (STRATO)
- ✅ Sub-Domain: `tiktok.epower-world.com` erstellt
- ✅ SFTP eingerichtet: Server `59521601.ssh.w1.strato.hosting` (Port 22)
- ✅ Detaillierte Upload-Anleitung in `website/README.md`
- ✅ ZIP zum Hochladen: `website-deploy.zip` (Projektordner)

## ⏳ Nächste Schritte (offen — wartet auf Boss)

1. **5 HTML-Dateien per SFTP ins `htdocs` hochladen**