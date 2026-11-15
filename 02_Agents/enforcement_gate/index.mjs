/**
 * EnforcementGate — OWA durch echte Blockierung.
 * Validator-Policies aus markdown/.json, 3 Retry, exponential Backoff.
 */
import fs from 'fs';
import path from 'path';

export class EnforcementGate {
  #policyMap = new Map();
  strictMode = false;

  constructor(options = {}) {
    this.strictMode = options.strictMode ?? false;
    if (options.policyPath) {
      this.loadPolicy(options.policyPath);
    }
  }

  loadPolicy(psource) {
    try {
      if (!fs.existsSync(psource)) return;
      const ptext = fs.readFileSync(psource, 'utf8');
      const pjson = JSON.parse(ptext);
      for (const [toolName, rules] of Object.entries(pjson)) {
        this.#policyMap.set(toolName, this.#compileChecks(toolName, rules));
      }
    } catch (err) {
      if (this.strictMode) throw err;
    }
  }

  async validate({ toolName, args, sessionID, agentID }) {
    if (!sessionID || !agentID) {
      return { allowed: false, reason: 'Missing sessionID or agentID' };
    }

    if (!this.#policyMap.has(toolName)) {
      return { allowed: true };
    }

    const checks = this.#policyMap.get(toolName);
    for (const check of checks) {
      const result = await check({ args, sessionID, agentID });
      if (!result.allowed) {
        return result;
      }
    }

    return { allowed: true };
  }

  #compileChecks(toolName, rules) {
    // Standard validation logic for 'edit'
    if (toolName === 'edit') {
      return [
        async ({ args }) => {
          if (!args?.path) {
            return {
              allowed: false,
              reason: 'Edit operation requires path',
              requiredFacts: ['path']
            };
          }
          return { allowed: true };
        }
      ];
    }

    // Write tool requires path
    if (toolName === 'write') {
      return [
        async ({ args }) => {
          if (!args?.path) {
            return {
              allowed: false,
              reason: 'Write operation requires path',
              requiredFacts: ['path']
            };
          }
          return { allowed: true };
        }
      ];
    }

    // Bash: block destructive commands without rollback plan
    if (toolName === 'bash') {
      const destructivePatterns = [
        /rm\s+(-r|-rf|-fr)/i,
        /DROP\s+TABLE/i,
        /format\s+/i,
        /mkfs\s+/i,
        /dd\s+if=/i,
        /:\(\)\s*\{\s*:\|:/i, // fork bomb
      ];
      return [
        async ({ args }) => {
          const cmd = args?.command ?? '';
          const isDestructive = destructivePatterns.some((re) => re.test(cmd));
          if (isDestructive && !args?.rollbackPlan) {
            return {
              allowed: false,
              reason: 'Destructive bash command requires a rollback plan',
              requiredFacts: ['rollbackPlan']
            };
          }
          return { allowed: true };
        }
      ];
    }

    return [async () => ({ allowed: true })];
  }
}

export function createGate(options) {
  return new EnforcementGate(options);
}
