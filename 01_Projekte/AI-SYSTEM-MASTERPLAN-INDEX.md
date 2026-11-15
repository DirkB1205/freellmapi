---
aliases: [masterplan-index, ai-system-masterplan, masterpläne]
tags: [projekt, moc, masterplan, ai-system-3-0]
created: 2026-10-11
status: aktiv
updated: 2026-11-06
related: "[[Projekte/AI-SYSTEM]]"
migrated_from: "AI-System 3.0 / Projekte/AI-SYSTEM-MASTERPLAN-INDEX.md"
---

# AI-SYSTEM 3.0 – Masterplan-Index (zentrale Fundstelle)

> **Zweck:** EINE Einstiegsstelle für alle Masterpläne. Die Pläne liegen als
> Arbeitsdokumente im Code-Repo (`E:\AI-System 3.0\code\docs\`), werden hier
> aber registriert, verlinkt und mit Status geführt – damit sie jederzeit
> wiedergefunden werden.

## Projektstatus
- [x] Planung
- [x] Umsetzung
- [ ] Test
- [ ] Abgeschlossen

## Projektziel

Zentrale Registry aller Masterpläne mit Status-Tracking und Verknüpfungen.

## 1. Wo die Masterpläne liegen

Code-Repo (Arbeitsstand): `E:\AI-System 3.0\code\`
Vault (dieses zweite Gehirn): `E:\AI-System 3.0\`

| Masterplan | Datei (Code-Repo) | Rolle |
|---|---|---|
| Delta-Masterplan 3.0 | `docs\DELTA-MASTERPLAN-3.0.md` | Kern-System (Telegram, Queue, TTS, Web-Agent, Capability-Router, Engine-Abstraktion) |
| Cluster-Masterplan | `docs\AI-SYSTEM-CLUSTER-MASTERPLAN.md` | Server + Clients (verteilter Teams-artiger Cluster) |
| Phase A Detailplan | `docs\PHASE-A-DETAILPLAN.md` | Coordinator-API + Client-Skelett (Umsetzung) |
| Phase B Detailplan | `docs\PHASE-B-DETAILPLAN.md` | Echte Arbeitsverteilung (Runner/Gates/Roundtrip) |
| Phase C Detailplan | `docs\PHASE-C-DETAILPLAN.md` | Projekt-DAG, Artefakt-Store, Review-Gate, UI |
| Phase 2 (Open WebUI) | `docs\PHASE2-OPENWEBUI-MACHBARKEIT.md` | optional, auf Abruf |
| Phase E Detailplan | `docs\PHASE-E-DETAILPLAN.md` | Monitoring, CI/CD, Security-Härtung, Doku, Skalierung |
| Ist-Audit 30.09. | Vault `01_Projekte\AI-SYSTEM-3-0-Ist-Audit-2026-09-30.md` | gemessener Ist-Stand |
| Projekt-Dossier | Vault `01_Projekte\AI-SYSTEM.md` | Ziel/Architektur/Betrieb |
| Phase-B/C-Dossier | Vault `01_Projekte\AI-SYSTEM-CLUSTER-PHASE-B-C.md` | Umsetzung + Abnahme B & C |

## 2. Ist-Stand vs. Bedarf (kurz)

| Bereich | Haben (belegt) | Fehlt / offen |
|---|---|---|
| Kern 1–6 (Delta) | ✅ Queue+Lease, Telegram, TTS (Piper), Web-Agent, Deep-Research, Capability-Router, Engine-Abstraktion | – Kern produktiv |
| Cluster Phase A | ✅ Coordinator-API + Client + Lease/Fencing (committet `f49d1ef`, nachgehärtet) | – (T5 Tailscale ✅ 2026-10-15) |
| Cluster Phase B | ✅ Client-Runner (stub/real + Gates), echte Caps, Enqueue-Klassifikation, Ergebnis-Roundtrip, Caps-Routing | – (T5 Tailscale ✅ 2026-10-15) |
| Cluster Phase C | ✅ Projekt-DAG (`deps`), Artefakt-Store (sha256/Range), Review-Gate + Merge-Manifest (logisch), Cluster-UI `/ui` | – (Git-Worktrees optional Phase D) |
| Cluster Phase D | 🟡 TLS, Freunde-Scoping, Cluster-Web-UI, Storage-Backend austauschbar (local/S3), Standby-Server (Auto-Failover mit Fencing) | Tailnet-ACL-Policy geliefert + Tailscale auf Dev-PC installiert (v1.104.1, `BielerNet`=100.70.198.28) — Anwendung der Policy durch Boss offen |
| Cluster Phase E | 🟡 E.1 Monitoring umgesetzt; E.2 CI/CD-Basis umgesetzt | E.2 Coverage/Pre-Commit/Container-Abnahme sowie E.3–E.5 offen |
| Repo-Hygiene | 🟡 Cluster-Code A/B/C committet (2026-10-12) | ⚠️ weiterhin viele fremde/uncommittete Änderungen (andere Chats) → Befund: [[01_Projekte/AI-SYSTEM-REPO-HYGIENE-2026-10-11]] |

## 3. Phasen-Status (Masterplan §12)

- [x] **Phase A – Fundament (Coordinator-API + Client-Skelett)**
- [x] **Phase B – Echte Arbeitsverteilung** ✅ **2026-10-12 abgeschlossen**
- [x] **Phase C – Projekt & Zusammenführung** ✅ **2026-10-12 abgeschlossen**
- [ ] **Phase D – Härtung & Komfort** (TLS, Freunde-Scoping, Web-UI, Standby)
- [ ] **Phase E – Monitoring, CI/CD, Security-Härtung, Doku, Skalierung**

## Nächste Schritte
- Phase D abschließen (Tailnet-ACL-Policy anwenden)
- Phase E.2 Coverage/Pre-Commit/Container-Abnahme
- Repo-Hygiene verbessern