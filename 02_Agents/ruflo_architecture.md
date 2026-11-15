---
tags: [Architektur, ruflo, ESM, Module, Enforcement]
created: 2026-11-09
updated: 2026-11-09
---

# ruflo-Module – Architektur-Spezifikation

## Überblick

Vier autonome ESM-Module, die ruflo-Vorteile nachbauen – ohne ruflo-Abhängigkeit.

```
┌─────────────────────────────────────────────────────────────┐
│                    omni-daemon.js (CJS)                     │
│  (polls OMNI-INBOX.md, CommonJS, repo-root)                 │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────┴────────────┐
         │  Bridging-Layer (CJS→ESM)  │
         │  (dynamic import / wrapper)  │
         └───────────┬────────────┘
                     │
    ┌────────────────┼────────────────┐
    │                │                │
┌───▼────┐   ┌──────▼──────┐   ┌─────▼──────┐
│Enforce │   │HMAC-Proof   │   │Policy-     │
│-Gate   │   │-Chain       │   │Compiler    │
│(ESM)   │   │(ESM)        │   │(ESM)       │
└────────┘   └─────────────┘   └────────────┘
                                      │
                                 ┌────▼─────┐
                                 │Intent/   │
                                 │Shard-    │
                                 │Retriever │
                                 │(ESM)     │
                                 └──────────┘
```

## Modul 1: Enforcement-Gate (Prio: HIGH)

### Zweck
Policy-Validierung VOR jeder Tool-Ausführung. Erweitert gateguard fact-forcing.

### Schnittstelle
```javascript
// enforcement_gate/index.js (ESM)
export class EnforcementGate {
  constructor(options?: {
    policyPath?: string,
    logPath?: string,
    strictMode?: boolean
  });
  
  async validate(request: {
    toolName: string,
    args: Record<string, unknown>,
    sessionID: string,
    agentID: string
  }): Promise<{
    allowed: boolean,
    reason?: string,
    requiredFacts?: string[]
  }>;
}

export function createGate(options?: object): EnforcementGate;
```

### Integration in omni-daemon.js
```javascript
// omni-daemon.js (CJS)
const { createGate } = await import('./02_Agents/enforcement_gate/index.js');
const gate = createGate({ policyPath: './.claudesync', strictMode: true });

// Vor Tool-Ausführung:
const result = await gate.validate({
  toolName: 'edit',
  args: { path: '...', oldString: '...' },
  sessionID: 'ses_...',
  agentID: 'omni-daemon'
});
if (!result.allowed) {
  log(`❌ Blocked: ${result.reason}`);
  return;
}
```

### Test-Strategie (TDD, ≥80% Coverage)
- `enforcement_gate.test.js`: Unit-Tests für validate()-Logik
- `enforcement_gate-integration.test.js`: Integration mit omni-daemon.js
- Pattern: gateguard-fact-force.test.js (spawnSync, temp state dirs)

---

## Modul 2: HMAC-Proof-Chain (Prio: MEDIUM)

### Zweck
Tamper-evidente Log-Kette jeder Agent-Ausführung (Hash-Kette mit HMAC-Signatur).

### Schnittstelle
```javascript
// hmac_proof_chain/index.js (ESM)
export class ProofChain {
  constructor(secretKey: string | Buffer, options?: {
    algorithm?: 'sha256' | 'sha512',
    logPath?: string
  });
  
  append(entry: {
    timestamp: string,
    action: string,
    details: Record<string, unknown>
  }): string; // returns hex hash
  
  verify(): { valid: boolean, firstInvalidIndex?: number };
  getChain(): Array<{ hash: string, entry: object }>;
}

export function createChain(secretKey: string, options?: object): ProofChain;
```

### Security
- Secret-Key aus Umgebungsvariable `ECC_HMAC_SECRET` (nie im Code)
- Key-Generierung: `crypto.randomBytes(32)` bei erster Initialisierung

---

## Modul 3: Policy-Compiler (Prio: MEDIUM)

### Zweck
Transformiert deklarative CLAUDE.md / .claudesync Policy-Dateien in ausführbare Rules.

### Schnittstelle
```javascript
// policy_compiler/index.js (ESM)
export class PolicyCompiler {
  compile(policyPath: string): CompiledPolicy;
  validate(policy: object): { valid: boolean, errors: string[] };
}

export interface CompiledPolicy {
  rules: Array<{
    id: string,
    condition: (context: object) => boolean,
    action: 'allow' | 'deny' | 'require-facts',
    message?: string
  }>,
  metadata: { sourcePath: string, compiledAt: string }
}
```

### Policy-Syntax (Beispiel)
```yaml
# .claudesync
rules:
  - id: no-destructive-edits
    match:
      tool: edit
      pathPattern: ".*\\.(env|secrets|config)\\..*"
    action: deny
    message: "Keine .env-Dateien editieren ohne explizite Bestätigung"
  
  - id: require-facts-for-edit
    match:
      tool: edit
    action: require-facts
    requiredFacts:
      - "importers of this file"
      - "test coverage impact"
```

---

## Modul 4: Intent/Shard-Retriever (Prio: MEDIUM)

### Zweck
Klassifiziert Anfragen und wählt passende Shards/Modelle/Agents aus.

### Schnittstelle
```javascript
// intent_retriever/index.js (ESM)
export class IntentRetriever {
  classify(query: string): Intent;
  selectShard(intent: Intent): Shard;
  selectModel(intent: Intent, shard: Shard): ModelConfig;
}

export interface Intent {
  category: 'code' | 'research' | 'debug' | 'deploy' | 'security',
  complexity: 'low' | 'medium' | 'high',
  riskLevel: 'safe' | 'review-required' | 'blocked',
  suggestedAgents: string[]
}

export interface Shard {
  id: string,
  context: string[],
  skills: string[],
  rules: string[]
}
```

---

## Bridging-Strategie (CJS → ESM)

### Option A: Dynamic Import (empfohlen)
```javascript
// In omni-daemon.js (CJS)
async function loadESMModule(modulePath) {
  const mod = await import(modulePath);
  return mod; // { createGate, EnforcementGate, ... }
}
```

### Option B: Wrapper-Module (CJS)
```javascript
// enforcement_gate.wrapper.js (CJS)
let _module = null;
async function ensureLoaded() {
  if (!_module) {
    _module = await import('./enforcement_gate/index.js');
  }
  return _module;
}

module.exports = {
  async createGate(opts) {
    const mod = await ensureLoaded();
    return mod.createGate(opts);
  }
};
```

---

## Dateistruktur

```
E:\AI-System 3.0\
├── omni-daemon.js                      # CommonJS, Integration Point
├── 02_Agents/
│   ├── ruflo_adapt.md                  # Tracking (exists)
│   ├── ruflo_architecture.md           # Architektur (neu)
│   ├── enforcement_gate/
│   │   ├── index.js                    # ESM Export
│   │   ├── gate-core.js                # Validierungslogik
│   │   └── policy-loader.js            # Policy-Parser
│   ├── hmac_proof_chain/
│   │   ├── index.js
│   │   └── chain-core.js
│   ├── policy_compiler/
│   │   ├── index.js
│   │   ├── compiler.js
│   │   └── yaml-parser.js
│   └── intent_retriever/
│       ├── index.js
│       ├── classifier.js
│       └── shard-registry.js
├── 02_ECC/
│   ├── tests/
│   │   └── hooks/
│   │       ├── enforcement_gate.test.js
│   │       └── enforcement_gate-integration.test.js
│   └── scripts/hooks/
│       └── (gateguard-fact-force.js exists)
└── .claudesync                         # Policy-Datei (wird erstellt)
```

---

## Nächste Schritte

1. ✅ Architektur-Dokument erstellt
2. ⏭️ Enforcement-Gate Pilot implementieren (ESM)
3. ⏭️ TDD-Test-Harness aufsetzen (gateguard-Pattern)
4. ⏭️ Integration in omni-daemon.js testen
5. ⏭️ HMAC-Proof-Chain als nächstes Modul

## Quellen
- gateguard-fact-force.js: 02_ECC/scripts/hooks/gateguard-fact-force.js (1352 Zeilen, CJS)
- Test-Pattern: 02_ECC/tests/hooks/gateguard-fact-force.test.js
- omni-daemon.js: E:\AI-System 3.0\omni-daemon.js (CJS, pollt Inbox)
