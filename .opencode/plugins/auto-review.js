import { writeFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { execSync } from "node:child_process";

const VAULT = "E:/AI-System 3.0/codeguardian";
const REVIEWER_MODEL = process.env.REVIEWER_MODEL || "ollama/codellama:latest";
const MAX_RETRIES = 3;

const runVerify = async ($) => {
  try {
    const out = await $`python scripts/verify.py`.text();
    return { ok: true, stdout: out, exitCode: 0 };
  } catch (e) {
    return { ok: false, stdout: e.stdout || "", stderr: e.stderr || "", exitCode: e.exitCode || 1 };
  }
};

const callReviewer = async (client, sessionID, prompt) => {
  const res = await client.session.prompt({
    path: { id: sessionID },
    body: {
      model: REVIEWER_MODEL,
      agent: "reviewer",
      parts: [{ type: "text", text: prompt }],
    },
  });
  return (res.data?.parts ?? []).filter(p => p.type === "text").map(p => p.text).join("\n");
};

export const AutoReview = async ({ client, $, directory }) => {
  const sessionRetries = new Map();

  return {
    event: async ({ event }) => {
      if (event.type !== "session.idle") return;
      const sessionID = event.properties.sessionID;

      const diff = (await $`git status --porcelain`.text()).trim();
      if (!diff) return;

      // S1: Provider-Health-Check
      try {
        await $`python scripts/check_providers.py`;
      } catch (e) {
        console.error("[auto-review] Provider-Health-Check fehlgeschlagen:", e.message);
        return;
      }

      const retryCount = sessionRetries.get(sessionID) ?? 0;
      if (retryCount >= MAX_RETRIES) {
        console.error("[auto-review] MAX_RETRIES erreicht — ESCALATE");
        return;
      }

      // GCR Loop: GENERATE (bereits erfolgt) → VERIFY → CRITIQUE → REVISE
      const verifyResult = await runVerify($);

      const project = path.basename(directory);
      const stamp = new Date().toISOString().slice(0, 16).replace("T", " ").replace(":", "-");
      const status = verifyResult.ok ? "bestanden" : "fehlgeschlagen";
      const abweichungen = verifyResult.ok ? 0 : 1;

      let critiquePrompt = `Projekt: ${project}, Durchlauf: ${retryCount + 1}/${MAX_RETRIES}
Diff:\n${diff}\n\n`;

      if (!verifyResult.ok) {
        critiquePrompt += `VERIFY FAILED (exit ${verifyResult.exitCode}):\n${verifyResult.stderr || verifyResult.stdout}\n\n` +
          `CRITIQUE: Analysiere den Fehler. Nenne exakte Zeile, Ursache, Fix-Vorschlag.`;
      } else {
        critiquePrompt += `VERIFY PASSED. Prüfe trotzdem: Schritt-Kommentare, Doctests (≥1 Happy-Path + ≥1 Edge-Case), keine Secrets, Typ-Hints überall.`;
      }

      const note = await callReviewer(client, sessionID, critiquePrompt);

      // YAML-Frontmatter sicherstellen
      const frontmatter = `---
typ: code-pruefung
projekt: ${project}
datum: ${new Date().toISOString()}
status: ${status}
abweichungen: ${abweichungen}
durchlauf: ${retryCount + 1}
dateien:
${diff.split('\n').filter(l => l.startsWith(' M ') || l.startsWith('M ') || l.startsWith('?? ')).map(l => `  - ${l.trim().split(' ')[1]}`).join('\n')}
tags: [code-pruefung, codeguardian, ${project}, review]
---
`;

      const fullNote = note.startsWith("---") ? note : frontmatter + note;
      const file = path.join(VAULT, `Prüfung-${project}-${stamp}.md`);
      await mkdir(VAULT, { recursive: true });
      await writeFile(file, fullNote, "utf8");
      await writeFile(".codeguardian-last-run", new Date().toISOString(), "utf8");

      if (!verifyResult.ok) {
        sessionRetries.set(sessionID, retryCount + 1);
        console.log(`[auto-review] Loop continues: retry ${retryCount + 1}/${MAX_RETRIES}`);
      } else {
        console.log(`[auto-review] Review bestanden — Note: ${file}`);
      }
    },
  };
};

export default AutoReview;
