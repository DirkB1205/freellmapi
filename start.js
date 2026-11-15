const { spawnSync } = require('child_process');
const fs = require('fs');

// Start AI-SYSTEM with fresh, full logging
const proc = spawnSync({ command: 'node', cwd: 'E:\\AI-System 3.0\\code\\AI-SYSTEM', args: ['src/core.js'], stdio: ['pipe', 'pipe', 'pipe'] });

console.log('Process status:', { pid: proc.pid, status: proc.status, code: proc.stderr?.trim() });

if (proc.error && proc.stderr?.includes('EPIPE')) {
  console.error('Stream closed - logging was already suppressed!');
  process.exit(1);
}

const logOutput = await new Promise((resolve) => {
  let buffer = '';
  proc.stdout.on('data', d => buffer += d);
  proc.stderr.on('data', d => buffer += d);
  
  // Check for EPIPE in buffer (logged-out process)
  if (buffer.includes('EPIPE')) {
    console.error('Stream closed - logging was already suppressed!');
    process.exit(1);
  }
  
  resolve(buffer);
});

console.log('\n=== AI-SYSTEM Log Output ===\n');
console.log(logOutput);

process.exit(proc.status);
