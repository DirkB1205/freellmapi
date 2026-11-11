import { execSync } from "node:child_process";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import fs from "node:fs";

// ─── Konfiguration ────────────────────────────────────────────────────────────
const VAULT_DIR = "E:/AI-System 3.0/codeguardian";
const DOTENV = "E:/AI-System 3.0/.env";
const LOG_FILE = "E:/AI-System 3.0/.opencode/run-review.log";

// .env lesen (Windows-kompatibel)
const REVIEWER_MODEL = (() => {
  try {
    const content = fs.readFileSync(DOTENV, "utf8");
    const match = content.match(/^REVIEWER_MODEL=(.+)$/m);
    return match ? match[1].trim().replace(/["']/g, "") : "ollama/codellama:latest";
  } catch {
    return "ollama/codellama:latest";
  }
})();

const log = (msg) => {
  const ts = new Date().toISOString();
  console.log(`[${ts}] ${msg}`);
  try {
    execSync(`echo "[${ts}] ${msg}" >> "${LOG_FILE.replace(/\//g, "\\")}"`, { shell: "cmd" });
  } catch {}
};

// ─── helpers ──────────────────────────────────────────────────────────────────
const parseEnv = async () => {
  let vars = {};
  try {
    const content = await readFile(DOTENV, "utf8");
    for (const line of content.split("\n")) {
      const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.+)/);
      if (m) vars[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch {}
  return vars;
};

const getChangedPythonFiles = () => {
  try {
    const out = execSync("git status --porcelain", { encoding: "utf8" }).trim();
    return out
      .split("\n")
      .filter((l) => l.trim() && /\.py$/.test(l))
      .map((l) => l.slice(3).trim()) // Porcelain: immer 2 Status-Zeichen + Leerzeichen + Pfad
      .filter(Boolean);
  } catch {
    return [];
  }
};

const runVerify = () => {
  const bashPath = "C:\\Program Files\\Git\\bin\\bash.exe";
  try {
    const out = execSync(`"${bashPath}" scripts/verify.sh .`, { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 });
    return { ok: true, stdout: out, stderr: "", exitCode: 0 };
  } catch (e) {
    return {
      ok: false,
      stdout: (e.stdout || "").toString(),
      stderr: (e.stderr || "").toString(),
      exitCode: e.status ?? 1,
    };
  }
};

// ─── Ollama Direct Call (keine SDK erforderlich) ─────────────────────────────
const callOllama = async (prompt) => {
  const modelName = REVIEWER_MODEL.replace("ollama/", ""); // "codellama:latest"
  const body = JSON.stringify({
    model: modelName,
    prompt: prompt,
    stream: false,
    options: { temperature: 0.2, num_predict: 2000 },
  });
  console.log(`[Ollama] POST http://127.0.0.1:11434/api/generate  model=${modelName}`);
  const res = await fetch("http://127.0.0.1:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    signal: AbortSignal.timeout(300_000),
  });
  if (!res.ok) throw new Error(`Ollama HTTP ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.response?.trim() || "(leere Antwort)";
};

// ─── Hauptpipeline ────────────────────────────────────────────────────────────
export const runReview = async () => {
  log("=== Manuelle Codeguardian-Pipeline gestartet ===");
  const start = Date.now();

  // 1. Diff prüfen
  const changedFiles = getChangedPythonFiles();
  if (changedFiles.length === 0) {
    log("Keine Python-Änderungen erkannt – Abbruch.");
    return { skipped: true, reason: "no-changes" };
  }
  log(`Änderungen erkannt (${changedFiles.length} Dateien):`);
  changedFiles.forEach((f) => log(`  - ${f}`));

  // 2. verify.sh ausführen
  log("Starte scripts/verify.sh …");
  const verifyResult = runVerify();
  log(`verify.sh beendet — exit=${verifyResult.exitCode}, ok=${verifyResult.ok}`);
  if (verifyResult.stdout) console.log(verifyResult.stdout.slice(0, 1500));

  // 3. Reviewer prompt bauen — die Note-Struktur baut dieses Skript, das Modell liefert nur die Analyse
  const datum = new Date().toISOString().slice(0, 19);
  const filesList = changedFiles.map((f) => `  - ${f}`).join("\n");
  const statusLine = verifyResult.ok ? "bestanden" : "fehlgeschlagen";

  // Reale Test-Anzahl aus verify.sh-Output (kein undefined mehr)
  const passed = verifyResult.stdout.match(/(\d+) passed/);
  const failedM = verifyResult.stdout.match(/(\d+) failed/);
  let testInfo;
  if (verifyResult.ok && passed) testInfo = `${passed[1]} Doctests bestanden.`;
  else if (verifyResult.ok) testInfo = "keine Doctests in geänderten Dateien — übersprungen.";
  else if (failedM) testInfo = `${failedM[1]} Doctests fehlgeschlagen, Exit-Code ${verifyResult.exitCode}.`;
  else testInfo = `Exit-Code ${verifyResult.exitCode}.`;

  const reviewPrompt = `Du bist der Reviewer-Agent für die Codeguardian-Pipeline von AI-System 4.0.
Antworte NUR mit diesen drei Markern in dieser Reihenfolge, auf Deutsch, ohne Intro, ohne YAML-Frontmatter, ohne andere Überschriften:

[SCHRIITT-ABGLEICH]
Je eine Zeile: erwarteter Schritt (aus # Schritt-N-Kommentaren) vs. tatsächliche Ausführung.
[INPUT-OUTPUT]
Je geprüfte Funktion eine Zeile: Beispiel-Aufruf → erwartetes Ergebnis.
[ABWEICHUNGEN]
Je eine Zeile pro Abweichung (Edge-Case, Security, Typ-Hints) mit Dateiname, oder exakt: keine

verify.sh-Output (Beleg):
${(verifyResult.stdout || "").slice(0, 1500)}

Geänderte Dateien:
${filesList}`;

  log("Starte Ollama Reviewer (Modell: " + REVIEWER_MODEL + ") …");
  let reviewResult;
  try {
    reviewResult = await callOllama(reviewPrompt);
  } catch (err) {
    log("Ollama-Fehler: " + err.message);
    reviewResult = `## Fehler\nOllama-Call fehlgeschlagen: ${err.message}\n\nReviewer konnte nicht ausgeführt werden.`;
  }
  log("Reviewer abgeschlossen (" + ((Date.now() - start) / 1000).toFixed(1) + "s)");

  // 4. Vault-Note schreiben (Struktur lokal, Reviewer-Abschnitte per Marker extrahiert)
  const section = (name) => {
    const m = reviewResult.match(new RegExp(`\\[${name}\\]([\\s\\S]*?)(?=\\[(?:SCHRIITT-ABGLEICH|INPUT-OUTPUT|ABWEICHUNGEN)\\]|$)`));
    return m ? m[1].trim() : "";
  };
  const schritt = section("SCHRIITT-ABGLEICH") || "Schritt-Kommentare konnten nicht abgeglichen werden.";
  const inputOutput = section("INPUT-OUTPUT") || "(keine Funktionen mit Doctests geprüft)";
  const abweich = section("ABWEICHUNGEN") || "keine";
  const abweichCount = abweich.toLowerCase().startsWith("keine")
    ? 0
    : abweich.split("\n").filter((l) => /^(\s*[-*]|\d+\.)\s/.test(l)).length || (verifyResult.ok ? 0 : 1);

  let durchlauf = 1;
  try {
    durchlauf = fs.readdirSync(VAULT_DIR).filter((f) => f.startsWith("PRUEFUNG-") && f.endsWith(".md")).length + 1;
  } catch {}

  const noteName = `PRUEFUNG-${datum.replace(/[:.]/g, "-")}.md`;
  const notePath = path.join(VAULT_DIR, noteName);
  await mkdir(VAULT_DIR, { recursive: true });
  const finalContent = `---
typ: code-pruefung
projekt: codeguardian
datum: ${datum}
status: ${statusLine}
abweichungen: ${abweichCount}
durchlauf: ${durchlauf}
dateien:
${filesList}
tags: [codeguardian, review]
---

# Prüfung codeguardian — ${datum} — Lauf ${durchlauf}

## Ergebnis
${verifyResult.ok ? "✅ **Bestanden** — " : "❌ **Fehlgeschlagen** — "}${testInfo}

## Schritt-Abgleich
${schritt}

## Input/Output
${inputOutput}

## Abweichungen
${abweich}

## verify.sh
**Exit-Code:** ${verifyResult.exitCode}
\`\`\`
${(verifyResult.stdout || "").slice(0, 1500)}
${verifyResult.stderr ? "\nStderr:\n" + verifyResult.stderr.slice(0, 500) : ""}
\`\`\`

## Verknüpfungen
- [[OMNI-INBOX]]
- [[Code-Prüfungen Übersicht]]

---
_Generiert durch manuellen Run vom ${new Date().toISOString()} | Session-ID: ${randomUUID()}_
`;
  await writeFile(notePath, finalContent);
  log(`Vault-Note gespeichert: ${notePath}`);

  console.log(`\n✅ Pipeline fertig in ${(Date.now() - start) / 1000 | 0}s`);
  console.log(`📄 Note: ${notePath}`);
  return { ok: true, notePath, exitCode: verifyResult.exitCode, durationMs: Date.now() - start };
};

// CLI entry-point (direkter node-Aufruf → automatisch starten)
const scriptName = path.basename(process.argv[1] ?? "");
if (scriptName === "run-review.js") {
  runReview().catch((err) => {
    log("FATAL: " + err.message);
    console.error(err);
    process.exit(2);
  });
}
