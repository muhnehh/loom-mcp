import { spawn } from 'child_process';
import { describe, it, after } from 'node:test';
import { ok, strictEqual, match } from 'node:assert';

const WORKSPACE = process.cwd();
const client = createMCPClient();

function createMCPClient() {
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
          if (resolver) {
            pending.delete(msg.id);
            resolver(msg);
          }
        } catch { /* skip */ }
      }
    }
  });

  return {
    proc,
    callTool(name, args = {}) {
      return new Promise((resolve, reject) => {
        const id = Math.random().toString(36).slice(2, 9);
        const timer = setTimeout(() => {
          pending.delete(id);
          reject(new Error(`${name} timed out`));
        }, 20000);

        pending.set(id, (msg) => {
          clearTimeout(timer);
          resolve(msg.result?.content?.[0]?.text || '');
        });

        proc.stdin?.write(JSON.stringify({
          jsonrpc: '2.0',
          id,
          method: 'tools/call',
          params: { name, arguments: args }
        }) + '\n');
      });
    },
    destroy() { proc.kill(); }
  };
}

after(() => { client.destroy(); });

describe('loom_get_topology', () => {
  it('returns TOON skeleton for src/', async () => {
    const text = await client.callTool('loom_get_topology', { dir: 'src' });
    match(text, /topology:src/);
    match(text, /files:\d+/);
    match(text, /token_estimate:\d+/);
    match(text, /\.ts:/);
  });

  it('contains function signatures with fn: markers', async () => {
    const text = await client.callTool('loom_get_topology', { dir: 'src' });
    ok(text.includes('fn:'), 'should contain fn: markers');
    ok(text.includes('('), 'should contain parameter syntax');
  });

  it('excludes implementation bodies', async () => {
    const text = await client.callTool('loom_get_topology', { dir: 'src' });
    strictEqual(text.includes('return authService'), false);
    strictEqual(text.includes('const { '), false);
  });
});

describe('loom_focus', () => {
  it('returns full file content for a file path', async () => {
    const text = await client.callTool('loom_focus', { target: 'src/toon.ts' });
    ok(!text.startsWith('ERROR:'), 'should not error');
    match(text, /focused:src\/toon\.ts/);
    ok(text.includes('export function'), 'should include implementation');
  });

  it('returns function-only content with file::func syntax', async () => {
    const text = await client.callTool('loom_focus', { target: 'src/toon.ts::toTOON' });
    ok(!text.startsWith('ERROR:'), 'should not error');
    match(text, /focused:src\/toon\.ts::toTOON/);
  });

  it('reports line count and token estimate', async () => {
    const text = await client.callTool('loom_focus', { target: 'src/toon.ts' });
    ok(text.includes('lines:'), 'should report line count');
    ok(text.includes('token_estimate:'), 'should estimate tokens');
  });
});

describe('loom_get_active_diff', () => {
  it('returns session state with session_id and turns', async () => {
    await client.callTool('loom_focus', { target: 'src/toon.ts' });
    const text = await client.callTool('loom_get_active_diff');
    ok(!text.startsWith('ERROR:'));
    match(text, /session_id:/);
    match(text, /turns:\d+/);
    match(text, /focused:\d+/);
  });
});

describe('loom_blur', () => {
  it('removes a focused file', async () => {
    await client.callTool('loom_focus', { target: 'src/toon.ts' });
    const text = await client.callTool('loom_blur', { target: 'src/toon.ts' });
    ok(text.includes('unfocused:') || text.includes('NOT_FOCUSED:'));
  });

  it('reports NOT_FOCUSED for non-existent path', async () => {
    const text = await client.callTool('loom_blur', { target: 'nonexistent/file.ts' });
    ok(text.includes('NOT_FOCUSED:') || text.includes('ERROR:'));
  });
});

describe('loom_search_refs', () => {
  it('returns references for a known symbol', async () => {
    const text = await client.callTool('loom_search_refs', { symbol: 'toTOON' });
    ok(!text.startsWith('ERROR:'));
    match(text, /symbol:toTOON/);
    match(text, /scope:workspace/);
    match(text, /refs:\d+/);
  });

  it('respects scope parameter', async () => {
    const text = await client.callTool('loom_search_refs', { symbol: 'toTOON', scope: 'file' });
    match(text, /scope:file/);
  });
});
