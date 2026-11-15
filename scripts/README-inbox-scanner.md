# OMNI-INBOX Task Scanner

Automatischer Scanner für OMNI-INBOX.md. Prüft periodisch auf neue Aufgaben und routet sie an zuständige Agenten.

## Einrichtung

### Als systemd Service (Linux/macOS)

```bash
sudo tee /etc/systemd/system/ai-inbox-scanner.service << 'EOF'
[Unit>
Description=AI System Inbox Scanner
After=network.target

[Service]
ExecStart=/usr/bin/node /opt/ai-system/scripts/inbox-scanner.js --interval 30000
WorkingDirectory=/opt/ai-system
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable ai-inbox-scanner
sudo systemctl start ai-inbox-scanner
```

### Als Windows Dienst (NSSM)

```powershell
nssm install AIInboxScanner "C:\Program Files\nodejs\node.exe" "-- E:\AI-System 3.0\scripts\inbox-scanner.js --interval 30000"
nssm start AIInboxScanner
```

### Manuelless Start (Development)

```bash
node scripts/inbox-scanner.js --interval 30000
```

## Konfiguration

| Variable | Standard | Beschreibung |
|----------|----------|--------------|
| `--interval` | `60000` | Scan-Intervall in ms |
| `INBOX_PATH` | `./OMNI-INBOX.md` | Pfad zur Inbox-Datei |
| `LOG_DIR` | `./codeguardian/inbox-scanner` | Logverzeichnis |

## Log-Ausgabe

Logs werden geschrieben nach:
- stdout (konsole)
- `codeguardian/inbox-scanner/scanner-YYYY-MM-DD.log`
- `codeguardian/inbox-scanner/.last-scan.json` (Status)

## Bereich → Agent Mapping

| Bereich | Ziel-Agent |
|---------|------------|
| AI-System V4 | builder-v4 |
| Telegram v4 Neubau | builder-v4 |
| OmniRoute | omni-provider |
| Security | security-review |
| Fehler | general |

## API

```javascript
const { scanInbox, parseInbox, getTargetAgent, extractArea } = require('./scripts/inbox-scanner');

// Parser testen
const tasks = parseInbox(inboxContent);
const area = extractArea('2026-11-15: Testaufgabe (Bereich: AI-System V4)');
const agent = getTargetAgent(area);
```