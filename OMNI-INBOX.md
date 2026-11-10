# OmniRoute Control Board - Task Inbox

## Offene Tasks
- [x] 2026-11-10: PWA auf iPhone installieren — erledigt (Boss bestätigt „geht"). URL: https://bielernet.taila5f9c1.ts.net/ (Tailscale serve → 127.0.0.1:8130). Kern: Safari-Eintrag für Handyportalen ohne https://-Aufschriff scheitert an Port 80; alleine https:// oder klickbarer Telegram-Link. Ersatzpfad: Installationsprofil https://bielernet.taila5f9c1.ts.net/ai-system.webclip.mobileconfig.
- [in-progress] 2026-11-10: Hardware‑ und Sprachmodell‑Setup Beratung (Bereich: KI‑Setup)
- [in-progress] 2026-11-10: Postiz Google OAuth Credentials (Bereich: Postiz)
- [x] 2026-11-10: Neubau AI-SYSTEM v4 – Telegram↔opencode + PWA in einem neuen Dienst (Bereich: Telegram v4 Neubau) → E2E verifiziert: Telegram-From → Queue → opencode → Antwort im Chat geliefert (Job f862a65a, done, kein SEND-FAIL). v4 läuft: `Projekte/ai-system-v4/index.mjs`, Port 8130, PID 39688, Telegram on/lastError null. Legacy: alter core.js gestoppt, monitor-server.js unangetastet. PWA-Dateien: ai-system-v4/public/. Ansprechen via `@route Befehl`.
- [x] 2026-11-10: Inbound-Test Telegram→opencode wartet auf Boss-Ping im Bot-Chat (Bereich: Telegram v4 Neubau) → bestanden über echte Boss-Nachricht (TikTok-Videos-Frage): Antwort v4 delivered.
- [x] 2026-11-10: Phase 1 – AI-Sys4.0 Autonomie Eval-Gates + Retry-Loop (Bereich: Agenten-Architektur)
- [x] 2026-11-10: Telegram-Integration (@dirkb_bot) – Webhook & Test ( Bereich: Orchester-Daemon)
- [x] 2026-11-10: Telegram-Status: aktive Jobs + Sessions im /status abbilden – Bereich: Telegram v4 Neubau → Feature in `Projekte/ai-system-v4/index.mjs` ergänzt (Aktive Jobs: route/seit/Text; Sessions: route=sessionId), Service neu gestartet, `/api/status` verifiziert OK (telegram enabled, lastError null, queue 0/0/5/1). Telegram sieht damit aktuellen Bearbeitungsstand.
- [x] 2026-11-10: `opencode exit 1` behoben – Root Cause: hängengebliebene Opencode-Session (`ses_e3a6f94…`, identischer Snapshot-Hash wie beim Vorfahr-Fehler → deterministischer Exit-1 im `step_start`) statt frischer Session. Fix: Worker löscht `state.sessions[route]` nach Fehlschlag; Service neu gestartet (Node PID 36976). Retry (Job 1026b94f, frische Session) → **done**.

## Abgeschlossene Tasks
- [x] 2026-11-10: Autorecherche Autonomie-Konfiguration (6 Quellen, synthetisiert in `Projekte/AI-SYSTEM-4.0-AUTONOMIE-KONFIG.md`)
- [x] 2026-11-09: Orchester-Daemon `.gitignore` & `.env` für Telegram-Bot-Integration
- [x] 2026-11-09: Orchester-Daemon TelegramWebhookHandler & _set_telegram_webhook()
- [x] 2026-11-09: Orchester-Daemon --webhook-Flag, HTTPServer, Queue, Worker-Thread
- [x] 2026-11-08: Provider-Health-Check von requests auf urllib/ssl migriert (Zeile 45-56)
- [x] 2026-11-08: Dead-Letter-Einträge reduziert, .inbox-watch-state.json bereinigt

## Status-Log
- 2026-11-10: Boss-Freigabe für Phase 1 erhalten. Implementierung gestartet.
- 2026-11-10: Telegram-Integration wird aktiv: Webhook-Registrierung und Test notwendig.
- 2026-11-10: Session-Auto-Reset nach 50 Nachrichten pro Route implementiert (`CFG.orchestrator.sessionMaxMessages`, default 50, settings.json ergänzt) – verhindert DreamPrompting-413 durch aufwachsenden Kontext. Fix live (Server PID 6964, Start 11:51 > Code-Edit 11:38).
- 2026-11-10: E2E-Test bestanden: Orchestrator mit `sessionMaxMessages=2` gestartet, 2 Testjobs auf Route @default → Job 2 löste Auto-Reset aus (Log: "Session automatisch zurückgesetzt nach 2 Nachrichten (Kontextlimit)"), `sessions.json` geleert, beide Jobs `done` ohne 413. settings.json auf 50 zurückgesetzt, Test-Orchestrator wieder gestoppt (lief vorher nicht – Start via `scripts/start.ps1` wenn benötigt).
- 2026-11-10: Telegram-Bereinigung: Python-Orchester-Daemon (--webhook) beendet, 4 Altlasten-Jobs verworfen, alter Telegram-Webhook via deleteWebhook (drop_pending_updates) gelöscht. Einzige Verbindung jetzt: Node AI-SYSTEM (Long-Polling, PID aktualisiert) – `lastError: null`, Queue leer.
- 2026-11-10 12:05:55: Messenger-Bridge neu gestartet (PID läuft), Long-Polling aktiv, Fallback-Webhook :8124, keine ECONNRESET seit Fix.
- 2026-11-10 12:12:00: Telegram-Webhook erfolgreich bei Telegram API registriert. URL: https://strongly-peripheral-python-elliott.trycloudflare.com (Daemon PID 28488 auf Port 20129).
- 2026-11-10 14:50: ECONNRESET-Diagnose: OmniRoute-Prozess 19896 wedge — Port gebunden, Event-Loop stalled >10 s, keinerlei Antwort. Watchdog (Stufe 1) blind, weil Port-Check "läuft" meldet. Fix: Kill + Neustart via start-omniroute.ps1 → /api/health + /v1/models 200. FreeLLMAPI (401=alive) und Ollama (200) grün. Details: 05_Fehler/FEHLER-2026-11-10_omniroute-eventloop-stall-econnreset.md.
- 2026-11-10 14:57: ECONNRESET-Enddiagnose (2. Layer): omni-watchdog Task war DEAKTIVIERT (seit 2026-11-09 12:40) UND Get-NetTCPConnection liefert für alle Ports 0 Listener (cmdlet kaputt) → Watchdog killte gesunde Instanzen. Fix: watchdog.ps1 umgebaut (Test-PortListening via TcpClient, Doppel-Probe 2×20s + /api/health-Fallback, v4 statt Legacy core.js bewacht, start-omniroute.log existiert jetzt), Task re-aktiviert. Endtest 14:56: alle Dienste ok, OmniRoute stable ohne Neustart-Loop.
- 2026-11-10 15:15: ECONNRESET-Enddiagnose Layer 3: ZWEI parallele Watchdog-Instanzen (seit 14:03/14:04) killten sich gegenseitig die frisch gebooteten OmniRoute-Instanzen (Kill-Spirale, crash 4294967295). Beide Zombies beendet. Folgediagnose: `POST /v1/chat/completions model=auto` → HTTP 200 — der `omniroute/auto`-Router ist UNVERDÄCHTIG, die Chat-Fehler waren reine Server-Unavailability. Chats: einfach Anfrage wiederholen. Details: 05_Fehler/FEHLER-2026-11-10_watchdog-task-deaktiviert.md.
- 2026-11-10 16:30: Troubleshooting-Playbook erstellt: `04_Learnings/LEARNING-2026-11-10_omniroute-troubleshooting-playbook.md` (Dienste/Ports, Watchdogs, Fallstricke, Diagnose-Befehle, Reparatur-Ablauf, Do-Not-List, Dateipfade). Index aktualisiert. Zweck: nächste Störung schneller diagnostizieren, ohne das ganze System durchsuchen zu müssen.
- 2026-11-10: Telegram-/status implementiert (Bridge Long-Polling + orch daemon): /status baut Report aus OpenCode-Chats (chats.json), offenen Orchestrator-Tasks (tasks.db via `orch.cli tasks`) und offenen Inbox-Einträgen; Antwort via sendMessage. Tests: 13 passed. Bridge muss neu gestartet werden (start-messengers.ps1).
- 2026-11-10 ~14:52: Telegram-/status Feature abgeschlossen. Telegram-409 (getUpdates Conflict) behoben: Doppelter Poller (AI-SYSTEM v4 PID 36976 + Messenger-Bridge) → Bridge als Poller beendet, AI-SYSTEM v4 ist einziger Telegram-Poller (telegram running, lastError "", /api/status OK). /status via setMyCommands registriert (start/chats/status/reset). E2E: Telegram-Jobs via v4 (channel telegram) aktiv; /status liefert Queue + aktive Jobs + Sessions.
- 2026-11-10 ~13:55: `/status` in AI-SYSTEM v4 um aktive Jobs + Sessions pro Route erweitert. Antwortformat: Counts + „Aktive Jobs: –“ bzw. Liste (route/seit/Text) + „Sessions: route=ses…“. Service neu gestartet, /api/status verifiziert (telegram enabled, lastError null, queue 0/0/5/1).
- 2026-11-10 ~13:55: Fehler `opencode exit 1` (Job 7b50b10f, Telegram „Zeige mir die aktuellen Projekte“) nachgestellt: Root Cause = hängengebliebene Session `ses_e3a6f94…` (identischer Snapshot-Hash wie Vorfahr-Fehler d68a09e6 → deterministisch). Fix: Session nach Fehlschlag im Worker löschen; Service neu gestartet (Node PID 36976). Retry (Job 1026b94f, frische Session) → **done**.
## Aktuelle Eskalationen
- [x] ESCALATED 2026-11-10 11:43:44: `.ecc/test-task` (Retry 3) → **resolved-by-design**: Absichtlicher Negativ-Test, tsc-Fehler erwartet, System reagiert korrekt. Siehe `05_Fehler/escalation-20261110-114344.md`
