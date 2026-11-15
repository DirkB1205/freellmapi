#!/usr/bin/env node
/**
 * OMNI-INBOX Task Scanner
 * 
 * Prüft periodisch OMNI-INBOX.md auf neue Aufgaben,
 * identifiziert sie und leitet an den zuständigen Agenten weiter.
 * 
 * Usage:
 *   node scripts/inbox-scanner.js [--interval 30000]
 * 
 * Interval default: 60000ms (1 Minute)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ─── Konfiguration ───────────────────────────────────────────────────────────

const INBOX_PATH = path.join(__dirname, '..', 'OMNI-INBOX.md');
const LOG_DIR = path.join(__dirname, '..', 'codeguardian', 'inbox-scanner');
const LAST_SCAN_FILE = path.join(LOG_DIR, '.last-scan.json');
const DEFAULT_INTERVAL = 60000; // 1 Minute

// Bereich → Agent mapping
const AGENT_MAP = {
    'AI-System V4': 'builder-v4',
    'V4': 'builder-v4',
    'Telegram v4 Neubau': 'builder-v4',
    'OmniRoute': 'omni-provider',
    'Security': 'security-review',
    'Fehler': 'general',
};

// ─── Logging ─────────────────────────────────────────────────────────────────

function log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = data ? `${timestamp} [${level}] ${message} - ${JSON.stringify(data)}` : `${timestamp} [${level}] ${message}`;
    console.log(logEntry);
    
    // In Log-Datei schreiben
    try {
        if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
        const logFile = path.join(LOG_DIR, `scanner-${new Date().toISOString().split('T')[0]}.log`);
        fs.appendFileSync(logFile, logEntry + '\n');
    } catch (e) { /* silent */ }
}

// ─── Task Parsing ────────────────────────────────────────────────────────────

function parseInbox(content) {
    const lines = content.split('\n');
    const tasks = [];
    
    for (const line of lines) {
        // Suche nach "- [" oder "* ["
        const match = line.match(/^[*\-]\s*\[([ xX])\]\s*(.+?)$/);
        if (match) {
            const done = match[1].toLowerCase() === 'x';
            const rest = match[2];
            
            // Extrahiere Datum und Beschreibung
            const dateMatch = rest.match(/^(\d{4}-\d{2}-\d{2})[:\s]*(.+)$/);
            if (dateMatch) {
                tasks.push({
                    done,
                    date: dateMatch[1],
                    description: dateMatch[2].trim(),
                    raw: line.trim()
                });
            }
        }
    }
    
    return tasks;
}

function extractArea(description) {
    const areaMatch = description.match(/\(Bereich:\s*([^)]+)\)/);
    return areaMatch ? areaMatch[1] : 'Allgemein';
}

function extractSummary(description) {
    // Nimm den Teil vor dem ersten Gedankenstrich oder bis "—"
    const parts = description.split(/[—-]/);
    return parts[0].trim();
}

// ─── Last Scan Tracking ──────────────────────────────────────────────────────

function loadLastScan() {
    try {
        if (fs.existsSync(LAST_SCAN_FILE)) {
            return JSON.parse(fs.readFileSync(LAST_SCAN_FILE, 'utf8'));
        }
    } catch (e) { /* ignore */ }
    return { lastHash: null, scannedCount: 0, processedTasks: [] };
}

function saveLastScan(data) {
    try {
        fs.writeFileSync(LAST_SCAN_FILE, JSON.stringify(data, null, 2));
    } catch (e) { /* ignore */ }
}

function hashContent(content) {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
        const char = content.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString(16);
}

// ─── Routing ─────────────────────────────────────────────────────────────────

function getTargetAgent(area) {
    // Versuche exakten Match
    if (AGENT_MAP[area]) return AGENT_MAP[area];
    
    // Partial Match
    for (const [key, agent] of Object.entries(AGENT_MAP)) {
        if (area.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(area.toLowerCase())) {
            return agent;
        }
    }
    
    return 'general'; // Default
}

async function routeTask(task, area) {
    const agent = getTargetAgent(area);
    
    log('INFO', `Task erkannt: "${task.description}"`, { area, agent, taskDate: task.date });
    
    // Hier würde normalerweise die Weiterleitung an den Agenten passieren
    // Für jetzt dokumentieren wir es und markieren es als verarbeitet
    
    return { agent, routed: true };
}

// ─── Main Loop ───────────────────────────────────────────────────────────────

async function scanInbox() {
    try {
        // Lese Inbox
        const content = fs.readFileSync(INBOX_PATH, 'utf8');
        const currentHash = hashContent(content);
        const lastData = loadLastScan();
        
        // Nur prüfen wenn sich Inhalt geändert hat
        if (currentHash === lastData.lastHash) {
            return; // Keine Änderungen
        }
        
        log('INFO', 'Inbox-Inhalt geändert, scanne...');
        
        // Parst Tasks
        const tasks = parseInbox(content);
        const openTasks = tasks.filter(t => !t.done);
        
        log('INFO', `Gefunden: ${tasks.length} gesamt, ${openTasks.length} offen`, { total: tasks.length, open: openTasks.length });
        
        // Verarbeite neue offene Tasks
        let newRoutes = 0;
        for (const task of openTasks) {
            // Prüfe ob bereits verarbeitet
            if (lastData.processedTasks.includes(task.raw)) continue;
            
            const area = extractArea(task.description);
            const result = await routeTask(task, area);
            
            if (result.routed) {
                newRoutes++;
                lastData.processedTasks.push(task.raw);
                
                // Begrenze History
                if (lastData.processedTasks.length > 100) {
                    lastData.processedTasks = lastData.processedTasks.slice(-50);
                }
            }
        }
        
        // Aktualisiere Hash
        lastData.lastHash = currentHash;
        lastData.scannedCount++;
        saveLastScan(lastData);
        
        if (newRoutes > 0) {
            log('INFO', `${newRoutes} neuer Task(s) routiert`);
        } else {
            log('DEBUG', 'Keine neuen Tasks');
        }
        
    } catch (e) {
        log('ERROR', `Scan fehlgeschlagen: ${e.message}`, { error: e.stack });
    }
}

// ─── Start ───────────────────────────────────────────────────────────────────

async function main() {
    const args = process.argv.slice(2);
    const intervalIndex = args.indexOf('--interval');
    const interval = intervalIndex >= 0 
        ? parseInt(args[intervalIndex + 1]) || DEFAULT_INTERVAL
        : DEFAULT_INTERVAL;
    
    log('INFO', `Inbox Scanner gestartet (Interval: ${interval}ms)`);
    
    // Erster Scan sofort
    await scanInbox();
    
    // Periodisch
    setInterval(scanInbox, interval);
}

// Startup
if (require.main === module) {
    main().catch(e => {
        console.error('FATAL:', e);
        process.exit(1);
    });
}

module.exports = { scanInbox, parseInbox, getTargetAgent, extractArea };