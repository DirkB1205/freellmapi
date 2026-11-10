---
tags: [Learning, ECC, Architektur]
created: 2026-11-07
updated: 2026-11-07
---

# ECC-Import: Struktur statt Kopie

## Situation

Die ECC-Bibliothek (affaan-m/ECC, 298K Sterne, MIT-Lizenz) musste in AI-System 4.0 integriert werden. Die Gefahr bestand darin, einfach alle Dateien zu kopieren und damit die Struktur zu zerstören.

## Lösung

ECC wurde als eigenständiges Verzeichnis `02_ECC/` geklont (4.701 Dateien). Die OpenCode-Installation erfolgte über den offiziellen Installer mit `--no-hooks`-Flag in den globalen OpenCode-Config-Bereich. Die Agenten-Definitionen aus ECC (71 Agenten) ersetzen die 12 manuell erstellten Agenten-Markdown-Dateien.

## Warum funktioniert es

- **Trennung von Quelle und Konfiguration:** ECC-Quellcode bleibt in `02_ECC/`, die installierten Assets liegen im OpenCode-Config-Bereich. Aktualisierungen des ECC-Repo können nachverfolgt werden.
- **Keine Verdopplung:** Die Agenten-Definitionen werden nicht doppelt geführt – sie leben nur im OpenCode-Config-Bereich.
- **Wartbarkeit:** Neue ECC-Versionen können durch Re-Clone und Re-Install更新 werden, ohne die Vault-Struktur zu beeinträchtigen.

## Wiederverwendung

Wenn ein anderes Projekt eine externe Agenten-Framework-Bibliothek integrieren möchte: Repo klonen, Installer mit gezielten Flags ausführen, Konfiguration separat halten.