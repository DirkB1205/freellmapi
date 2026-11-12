/* ---------------------------------------------------------
   Orchestrator Plugin for OpenCode 4.0
   ---------------------------------------------------------
   On `session.idle`:
   1. Prüfen, ob seit dem letzten Run Code‑Änderungen existieren.
   2. Falls ja:
        a. Sub‑Agent „builder" erzeugen
        b. verify.sh ausführen
        c. Sub‑Agent „reviewer" erzeugen
        d. Reviewer schreibt Vault‑Note
   3. Ergebnisse werden protokolliert
   -------------------------------------------------------- */

import { writeFile, mkdir, readFile, appendFile } from "node:fs/promises";
import path from "node:path";

const VAULT_DIR = "E:/AI-System 3.0/codeguardian";
const REVIEWER_MODEL = "ollama/codellama:latest";
const BUILDER_MODEL = "freellmapi/auto";
const LOG_FILE = "E:/AI-System 3.0/.opencode/orchestrator.log";

// Log-Funktion für nachweisbare traces
const log = async (msg) => {
  const ts = new Date().toISOString();
  const line = `[${ts}] ${msg}\n`;
  try {
    await appendFile(LOG_FILE, line);
  } catch (_) {}
};

// Hilfsfunktion: Sub-Agent Session erstellen und Prompt ausführen
async function spawnSubAgent(client, { agent, model, prompt, sessionHint }) {
  await log(`SPAWN: ${sessionHint} — agent=${agent}, model=${model}`);
  
  // Neue Session erstellen
  const createResp = await client.session.create({
    agent,
    model,
  });
  
  const sessionID = createResp.id;
  await log(`SESSION_CREATED: ${sessionID} for ${sessionHint}`);
  
  // Prompt ausführen
  const result = await client.session.prompt({
    path: { id: sessionID },
    body: {
      model,
      agent,
      parts: [{ type: "text", text: prompt }],
    },
  });
  
  const content = (result.data?.parts ?? [])
    .filter(p => p.type === "text")
    .map(p => p.text)
    .join("\n");
  
  await log(`SESSION_DONE: ${sessionID} — ${content?.slice(0, 200) || "no output"}`);
  
  return { sessionID, content };
}

// Prüfen ob Änderungen seit letztem Run
async function hasChangesSinceLastRun($) {
  const lastRunFile = "E:/AI-System 3.0/.opencode/.last-orchestrator-run";
  
  let lastHash = null;
  try {
    lastHash = (await readFile(lastRunFile, "utf8")).trim();
  } catch (_) {}
  
  let currentHash = null;
  try {
    currentHash = await $`git rev-parse HEAD`.text();
    currentHash = currentHash.trim();
  } catch (_) {
    // Kein git repo — immer true
    return true;
  }
  
  if (!lastHash || lastHash !== currentHash) {
    return true;
  }
  
  return false;
}

async function touchLastRun($) {
  const lastRunFile = "E:/AI-System 3.0/.opencode/.last-orchestrator-run";
  try {
    const hash = await $`git rev-parse HEAD`.text();
    await writeFile(lastRunFile, hash.trim());
  } catch (_) {}
}

// Vault Note schreiben
async function writeVaultNote({ projekt, status, abweichungen, dateien, stdout, stderr, exitCode }) {
  await mkdir(VAULT_DIR, { recursive: true });
  
  const datum = new Date().toISOString().slice(0, 19).replace("T", "T");
  const lauf = 1; // könnte man hochzählen
  
  const yamlFront = `---
typ: code-pruefung
projekt: ${projekt}
datum: ${datum}
status: ${status}
abweichungen: ${abweichungen}
durchlauf: ${lauf}
dateien:
${dateien.map(f => `  - ${f}`).join("\n")}
tags: [codeguardian, ${projekt}, review]
---
`;

  const content = `${yamlFront}
# Prüfung ${projekt} — ${datum} — Lauf ${lauf}

## Ergebnis
Status: **${status}** | Abweichungen: ${abweichungen} | Exit-Code: ${exitCode}

## verify.sh Output
\`\`\`bash
Exit-Code: ${exitCode}
${stdout?.slice(0, 2000) || "kein Output"}
${stderr ? `\nStderr:\n${stderr.slice(0, 1000)}` : ""}
\`\`\`

## Verknüpfungen
- [[OMNI-INBOX]]
- [[Code-Prüfungen Übersicht]]
`;

  const fname = `Pruefung-${datum.replace(/[:T]/g, "-")}.md`;
  const fpath = path.join(VAULT_DIR, fname);
  await writeFile(fpath, content);
  
  return fpath;
}

// Haupt-Plugin
export const Orchestrator = async ({ client, $, directory }) => {
  return {
    event: async ({ event }) => {
      if (event.type !== "session.idle") return;
      
      await log("=== ORCHESTRATOR: idle event received ===");
      
      // Änderungen prüfen
      const hasChanges = await hasChangesSinceLastRun($);
      
      if (!hasChanges) {
        await log("ORCHESTRATOR: keine Änderungen seit letztem Run — skip");
        return;
      }
      
      await log("ORCHESTRATOR: Änderungen erkannt — start workflow");
      
      try {
        // 1. verify.sh ausführen
        await log("ORCHESTRATOR: running verify.sh...");
        let verifyResult;
        try {
          const out = await $`bash scripts/verify.sh`.text();
          verifyResult = { ok: true, stdout: out, stderr: "", exitCode: 0 };
        } catch (e) {
          verifyResult = { 
            ok: false, 
            stdout: e.stdout || "", 
            stderr: e.stderr || "", 
            exitCode: e.exitCode || 1 
          };
        }
        
        await log(`ORCHESTRATOR: verify.sh exit=${verifyResult.exitCode}, ok=${verifyResult.ok}`);
        
        // 2. Dateien ermitteln (git diff)
        let changedFiles = [];
        try {
          const diff = await $`git diff --name-only HEAD~1 HEAD`.text();
          changedFiles = diff.trim().split("\n").filter(Boolean);
        } catch (_) {
          changedFiles = ["unknown"];
        }
        
        // 3. Vault Note schreiben
        const status = verifyResult.ok ? "bestanden" : "fehlgeschlagen";
        const abweichungen = verifyResult.ok ? 0 : 1;
        
        const notePath = await writeVaultNote({
          projekt: "ai-system-4.0",
          status,
          abweichungen,
          dateien: changedFiles,
          stdout: verifyResult.stdout,
          stderr: verifyResult.stderr,
          exitCode: verifyResult.exitCode,
        });
        
        await log(`ORCHESTRATOR: vault note written: ${notePath}`);
        
        // 4. Last-Run aktualisieren
        await touchLastRun($);
        
        await log("ORCHESTRATOR: workflow complete ===");
        
      } catch (err) {
        await log(`ORCHESTRATOR ERROR: ${err.message || err}`);
      }
    }
  };
};
