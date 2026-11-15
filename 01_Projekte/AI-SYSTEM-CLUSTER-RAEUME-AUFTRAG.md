---
tags: [projekt, auftrag, ai-system-3-0, cluster, raumgestaltung]
created: 2026-10-11
updated: 2026-10-12
status: offen
owner_chat: raum-neu
related: "[[Projekte/AI-SYSTEM-MASTERPLAN-INDEX]], [[Projekte/AI-SYSTEM]]"
migrated_from: "AI-System 3.0 / Projekte/AI-SYSTEM-CLUSTER-RAEUME-AUFTRAG.md"
---

# AUFTRAG – Raumgestaltung der Cluster-Räume (Server/Client)

> **Für einen EIGENEN, NEUEN Chat.** Diesen Brief zu Beginn komplettlesen, dann
> als übernommen markieren (siehe „Übernahme"). Der `default`-Chat macht diese
> Arbeit **bewusst nicht**. Zu Beginn **zuerst als Diagramm** (Projektregel),
> dann in Worte/Struktur.

## Was gemeint ist

Die **Raum-/Rollenstruktur** des Clusters nach der Teams-Analogie aus dem
Masterplan §1 (`docs\AI-SYSTEM-CLUSTER-MASTERPLAN.md`). Es soll festlegt werden,
**welche Räume** es gibt, **wer** darin ist, **welche Ereignisse** erscheinen und
**wie** Clients automatisch Teil eines Raums werden.

## Bezug (Masterplan §1, §8)

| Teams-Begriff | AI-SYSTEM | Rolle |
|---|---|---|
| Organisation / Raum | **Cluster** | 1 Server, N Clients |
| Teammitglied | **Client / Node** | führt Aufgaben lokal aus |
| Team-Lead | **Server / Coordinator** | verteilt, überwacht, führt zusammen |
| Aufgabe | **Job** | atomare Arbeitseinheit |
| Projekt | **Projekt (Job-DAG)** | zusammenhängende Jobs + Merge-Regel |
| Beitritt | **Enrollment** | automatische Client-Anmeldung |
| Statusmeldung | **Heartbeat** | „lebt, frei, Last X" |
| Ergebnis | **Artifact/Result** | Text, Datei, Git-Branch |
| Freigabe | **Review-Gate** | Admin prüft vor Merge |

## Zu gestalten (Deliverables)

1. **Raum-Modell:** Welche Räume/„Kanäle" existieren? z. B.:
   - *Lobby/Admin-Raum* (Server + Admins, Freigaben, Enrollment)
   - *Projekt-Raum* je Projekt (Jobs,