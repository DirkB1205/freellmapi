const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const inboxPath = path.join(__dirname, 'OMNI-INBOX.md');
const logPath = path.join(__dirname, 'Projekte', 'autonomous-execution.log');
const gatePath = path.join(__dirname, '02_Agents', 'enforcement_gate', 'index.mjs');

let gate = null;

async function initGate() {
    try {
        const { createGate } = await import(`file://${gatePath}`);
        gate = createGate({ strictMode: true });
        log('✅ EnforcementGate initialisiert');
    } catch (err) {
        log(`⚠️ Gate nicht geladen: ${err.message}`);
        gate = null;
    }
}

function log(msg) {
    const entry = `[${new Date().toISOString()}] ${msg}\n`;
    console.log(entry.trim());
    fs.appendFileSync(logPath, entry);
}

const processTask = async () => {
    try {
        if (!fs.existsSync(inboxPath)) return;
        const content = fs.readFileSync(inboxPath, 'utf8').trim();

        if (!content || content.includes('<!-- leer -->') || content.length < 5) {
            return; // Keine neue Aufgabe
        }

        log(`\n🚨 Neue Aufgabe in der Inbox entdeckt:\n${content}`);

        // Inbox leeren, damit die Aufgabe nicht doppelt läuft
        fs.writeFileSync(inboxPath, '# OMNI-INBOX\n\n<!-- leer -->\n');

        log('⚙️ Starte autonome Ausführung...');

        // Tool-Call-Validierung
        if (gate) {
            const validation = await gate.validate({
                toolName: 'exec',
                args: { command: 'npm test' },
                sessionID: 'current-session',
                agentID: 'autonomy-daemon'
            });

            if (!validation.allowed) {
                log(`❌ Gate blockiert Ausführung: ${validation.reason}`);
                return;
            }
        }

        // Hier wird die Aufgabe verarbeitet (z.B. Testlauf oder Build)
        exec('npm test', { cwd: __dirname }, (error, stdout, stderr) => {
            if (error) {
                log(`❌ Fehler bei Ausführung: ${error.message}`);
            } else {
                log(`✅ Aufgabe erfolgreich ausgeführt:\n${stdout}`);
            }
        });
    } catch (err) {
        log(`❌ Fehler im Task-Loop: ${err.message}`);
    }
};

// Initialisierung des Gates und ersten Check
initGate().then(processTask).catch(console.error);

// Alle 10 Sekunden prüfen
setInterval(processTask, 10000);
