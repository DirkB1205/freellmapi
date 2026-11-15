import { writeFile, mkdir, appendFile, readdir } from "node:fs/promises";
import path from "node:path";
import os from "node:os";

const VAULT = "E:/AI-System 3.0/codeguardian";
const RAT_DIR = path.join(VAULT, "rat-decisions");
const MERGE_LOG = path.join(VAULT, "auto-merges.log");
const REVIEWER_MODEL = process.env.REVIEWER_MODEL || "ollama/codellama:latest";
const MAX_RETRIES = 3;

// Sicherstellung der Required-Directories und Log-Datei
const ensureInfrastructure = async () => {
  await mkdir(VAULT, { recursive: true });
  await mkdir(RAT_DIR, { recursive: true });
  try {
    await readdir(MERGE_LOG); // existiert?
  } catch {
    await writeFile(MERGE_LOG, "# Auto-Merge Log\n\nHier werden erfolgreiche Doctest-Läufe dokumentiert.\n\nFormat: \`[DATUM] [COMMIT_SHA] Projekt: <name>\`\n", "utf8");
  }
};

const runVerify = async ($) => {
  try {
    const out = await $`python scripts/verify.py`.text();
    return { ok: true, stdout: out, exitCode: 0 };
  } catch (e) {
    return { ok: false, stdout: e.stdout || "", stderr: e.stderr || "", exitCode: e.exitCode || 1 };
  }
};

const getLatestCommit = async ($) => {
  try {
    const sha = await $`git rev-parse --short HEAD`.text();
    return sha.trim();
  } catch {
    return "unknown";
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

// Ratsentscheidung als Markdown-Note in rat-decisions/ schreiben
const writeRatDecision = async (project, commit, errResult) => {
  const date = new Date().toISOString().slice(0, 10);
  const stamp = new Date().toISOString().replace("T", " ").replace(":", "-");
  const noteFile = path.join(RAT_DIR, `RAT-ENTSCHEIDUNG-${stamp}.md`);

  const frontmatter = `---
typ: rat-entscheidung
projekt: ${project}
datum: ${new Date().toISOString()}
commit: ${commit}
status: fehlgeschlagen
abgleich: doctest_exit_${errResult.exitCode}
tags: [codeguardian, rat, fehler]
---
`;
  const content = `# Rat-Entscheidung ${project} — ${date}

## Fehlerursache (Root-Cause)
${errResult.stderr || errResult.stdout}

## Risikobewertung
- **Security:** offen (muss Reviewer prüfen)
- **Stabilität:** beeinträchtigt
- **Datenverlust:** nein (Doctest-Schutz)

## Handlungsoptionen
a) Fortsetzung mit Modifikation (Reviewer-Fix vorschlagen)
b) Rollback zum letzten funktionierenden Stand
c) Manueller Override durch Boss (Dokumentation in OMNI-INBOX.md)

## Entscheidung
_Rat wird dispatched._
`;

  await writeFile(noteFile, frontmatter + content, "utf8");
  return noteFile;
};

export const AutoReview = async ({ client, $, directory }) => {
  const sessionRetries = new Map();

  await ensureInfrastructure();

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
        console.error("[auto-review] MAX_RETRIES erreicht — ESCALATE an Rat");
        return;
      }

      // VERIFY
      const verifyResult = await runVerify($);
      const project = path.basename(directory);
      const commit = await getLatestCommit($);
      const stamp = new Date().toISOString().slice(0, 16).replace("T", " ").replace(":", "-");

      // HYBRIDE LOGIK
      if (verifyResult.ok) {
        // === AUTO-MERGE Pfad ===
        const mergeLine = `[${new Date().toISOString()}] [${commit}] Projekt: ${project}\n`;
        await appendFile(MERGE_LOG, mergeLine, "utf8");
        await writeFile(".codeguardian-last-run", new Date().toISOString(), "utf8");
        console.log(`[auto-review] AUTO-MERGE: ${commit} → ${MERGE_LOG}`);
        return; // fertig
      }

      // === FEHLERPFAD: Reviewer + Rat ===
      const abweichungen = 1;
      const changedFiles = diff.split('\n')
        .filter(l => l.startsWith(' M ') || l.startsWith('M ') || l.startsWith('?? '))
        .map(l => l.trim().split(' ')[1]);

      const critiquePrompt = `Projekt: ${project}, Durchlauf: ${retryCount + 1}/${MAX_RETRIES}
Diff:
${diff}

VERIFY FAILED (exit ${verifyResult.exitCode}):
${verifyResult.stderr || verifyResult.stdout}

Bitte analysiere Root-Cause, nenne exakte Zeile und schlage einen Fix vor.
Erstelle eine Obsidian-Note im Format: typ, projekt, datum, status: fehlgeschlagen, abweichungen, durchlauf, dateien, tags.`;

      const reviewerNote = await callReviewer(client, sessionID, critiquePrompt);

      const yamlFrontmatter = `---
typ: code-pruefung
projekt: ${project}
datum: ${new Date().toISOString()}
status: fehlgeschlagen
abweichungen: ${abweichungen}
durchlauf: ${retryCount + 1}
dateien:
${changedFiles.map(f => `  - ${f}`).join('\n')}
tags: [code-pruefung, codeguardian, ${project}, review, fehlgeschlagen]
---
`;
      const noteContent = reviewerNote.startsWith("---") ? reviewerNote : yamlFrontmatter + reviewerNote;
      const noteFile = path.join(VAULT, `Prüfung-${project}-${stamp}.md`);
      await writeFile(noteFile, noteContent, "utf8");

      // Rat-Decisions-Note schreiben
      await writeRatDecision(project, commit, verifyResult);

      // Timestamp aktualisieren
      await writeFile(".codeguardian-last-run", new Date().toISOString(), "utf8");

      // Retry hochzählen
      sessionRetries.set(sessionID, retryCount + 1);
      console.log(`[auto-review] FAILURE → Note: ${noteFile}, Rat-Decision geschrieben`);
    },
  };
};

export default AutoReview;
