#!/usr/bin/env node
import { spawn } from 'child_process';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative, resolve } from 'path';
import { encoding_for_model } from 'tiktoken';

const WORKSPACE = resolve(process.cwd());

// Use tiktoken for accurate token counting (same as jCodeMunch)
let enc;
try {
  enc = encoding_for_model('cl100k_base');
} catch {
  enc = null;
}

function countTokens(text) {
  if (enc) {
    return enc.encode(text).length;
  }
  return Math.ceil(text.length / 4);
}

function globFiles(dir, extensions) {
  const results = [];
  const skip = new Set(['node_modules', '.git', 'dist', 'build', '__pycache__', '.venv', 'venv', '.loom', '.claude', 'test-project']);
  function walk(d) {
    try {
      for (const e of readdirSync(d)) {
        if (e.startsWith('.') || skip.has(e)) continue;
        const p = join(d, e);
        try {
          const s = statSync(p);
          if (s.isDirectory()) walk(p);
          else if (s.isFile()) {
            const ext = e.split('.').pop();
            if (extensions.has(ext)) results.push(p);
          }
        } catch {}
      }
    } catch {}
  }
  walk(dir);
  return results;
}

async function callTool(name, args = {}) {
  return new Promise((resolve) => {
    const proc = spawn('node', ['dist/index.js'], {
      cwd: WORKSPACE,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    const pending = new Map();
    let buffer = '';
    proc.stdout?.on('data', (d) => {
      buffer += d.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        if (line.trim() && line.includes('"id"')) {
          try {
            const msg = JSON.parse(line);
            const resolver = pending.get(msg.id);
            if (resolver) { pending.delete(msg.id); resolver(msg); }
          } catch {}
        }
      }
    });
    const t0 = Date.now();
    const id = Math.random().toString(36).slice(2, 9);
    pending.set(id, (msg) => resolve({ elapsed: Date.now() - t0, text: msg?.result?.content?.[0]?.text || '' }));
    proc.stdin?.write(JSON.stringify({ jsonrpc: '2.0', id, method: 'tools/call', params: { name, arguments: args } }) + '\n');
    setTimeout(() => { proc.kill(); resolve({ elapsed: -1, text: '' }); }, 20000);
  });
}

async function benchmark(dir) {
  const ext = new Set(['ts', 'tsx', 'js', 'jsx', 'py', 'rs', 'go', 'java', 'cs', 'c', 'cpp', 'h', 'hpp']);
  const absDir = resolve(WORKSPACE, dir);
  const files = globFiles(absDir, ext);

  // Read raw tokens from files using tiktoken
  let rawText = '';
  for (const f of files) {
    try { rawText += readFileSync(f, 'utf8'); } catch {}
  }
  const rawTokens = countTokens(rawText);

  // Use RELATIVE path for security (not absolute!)
  const relativeDir = dir === WORKSPACE || dir === '.' ? '.' : relative(WORKSPACE, absDir);
  
  const { elapsed, text } = await callTool('loom_get_topology', { dir: relativeDir });
  
  // Parse token_estimate from first 1000 chars  
  let loomTokens = 0;
  const headerArea = text.substring(0, 1000);
  const match = headerArea.match(/token_estimate[:\s]*(\d+)/i);
  if (match) {
    loomTokens = parseInt(match[1], 10);
  }

  // Fallback
  if (loomTokens === 0) {
    loomTokens = Math.ceil(text.length / 4);
  }

  const reduction = rawTokens > 0 ? Math.round((1 - loomTokens / rawTokens) * 100, 1) : 0;

  return {
    directory: dir === WORKSPACE ? '.' : relative(WORKSPACE, absDir) || '.',
    files: files.length,
    rawTokens: rawTokens,
    loomTokens: loomTokens,
    reduction: `${reduction}%`,
    latencyMs: elapsed,
    savings: rawTokens - loomTokens
  };
}

async function main() {
  const targets = process.argv.slice(2).filter(a => !a.startsWith('--'));
  if (!targets.length) targets.push('.');

  const results = [];
  for (const t of targets) {
    process.stdout.write(`Benchmarking ${t}... `);
    try {
      const r = await benchmark(t);
      results.push(r);
      process.stdout.write(`${r.files}f, ${r.reduction} reduction, ${r.latencyMs}ms\n`);
    } catch (e) {
      process.stdout.write(`ERROR: ${e.message}\n`);
    }
  }

  if (process.argv.includes('--json')) {
    console.log(JSON.stringify(results, null, 2));
  } else if (results.length) {
    console.log('\n' + '─'.repeat(70));
    console.log('Repo'.padEnd(24) + 'Files'.padEnd(7) + 'Raw'.padEnd(10) + 'TOON'.padEnd(10) + '%Save'.padEnd(7) + 'ms');
    console.log('─'.repeat(70));
    for (const r of results) {
      const name = r.directory.length > 23 ? '…' + r.directory.slice(-23) : r.directory;
      console.log(
        name.padEnd(24) +
        String(r.files).padEnd(7) +
        String(r.rawTokens).padEnd(10) +
        String(r.loomTokens).padEnd(10) +
        r.reduction.padEnd(7) +
        r.latencyMs
      );
    }
    console.log('─'.repeat(70));
  }
}

main().catch(e => { console.error(e.message); process.exit(1); });