// CodeGuardian PreToolUse Hook
// Führt grundlegende Qualitäts- und Sicherheitsprüfungen vor Tool-Ausführung durch

import { execSync } from 'child_process';

module.exports = async function preToolUse(toolCall) {
  const tool = toolCall.tool;

  // Nur für schreibende Operationen
  if (!['edit', 'write', 'shell'].includes(tool)) return toolCall;

  // 1. Secret-Grep: Prüfe, ob gefährliche Patterns in neuem Content vorhanden sind
  const dangerousPatterns = [/sk-[a-zA-Z0-9]{20,}/, /password\s*=\s*['"][^'"]+['"]/i];
  const content = toolCall.args?.content || toolCall.args?.command || '';
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(content)) {
      throw new Error(`CodeGuardian Block: Mögliches Klartext-Secret entdeckt.`);
    }
  }

  // 2. Git-Safety: Blockiere destructive Commands in Shell
  if (tool === 'shell') {
    const cmd = toolCall.args?.command || '';
    if (/git\s+push\s+.*--force/.test(cmd) || /rm\s+-rf\s+[\/\\]/.test(cmd)) {
      throw new Error(`CodeGuardian Block: Destruktiver Befehl abgefangen.`);
    }
  }

  return toolCall;
}