# Fehler: Kombiniertes Dashboard & Playwright / Browser-Routing

- **Datum:** 2026-11-02
- **Ursache:** Der Dashboard-Server in `Projekte/opencode-dashboard/server.mjs` lieferte statische Dateien nicht korrekt aus (z. B. `combined.html` mit falscher Länge/9 Bytes), weil nur bestimmte Routen hartkodiert waren.
- **Fix:** `server.mjs` anpassen, damit alle statischen Dateien im Verzeichnis korrekt mit den richtigen MIME-Types ausgeliefert werden.
