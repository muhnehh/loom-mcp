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

  it('reports token reduction metric', async () => {
    const text = await client.callTool('loom_get_topology', { dir: 'src' });
    match(text, /token_reduction:-?\d+%/);
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

  it('returns error for non-existent file', async () => {
    const text = await client.callTool('loom_focus', { target: 'nonexistent/file.ts' });
    ok(text.startsWith('ERROR:') || text.includes('ERROR:'), 'should return error');
  });
});

describe('loom_search_symbols', () => {
  it('returns ranked symbol matches', async () => {
    const text = await client.callTool('loom_search_symbols', { query: 'toTOON' });
    ok(!text.startsWith('ERROR:'));
    match(text, /query:toTOON/);
    ok(text.includes('results:'), 'should report result count');
  });

  it('limits results with limit parameter', async () => {
    const text = await client.callTool('loom_search_symbols', { query: 'to', limit: 3 });
    match(text, /query:to/);
  });
});

describe('loom_find_importers', () => {
  it('finds files that import a symbol', async () => {
    const text = await client.callTool('loom_find_importers', { symbol: 'toTOON' });
    ok(!text.startsWith('ERROR:'));
    match(text, /symbol:toTOON/);
    match(text, /importers:\d+/);
  });
});

describe('loom_blast_radius', () => {
  it('analyzes change impact', async () => {
    const text = await client.callTool('loom_blast_radius', { symbol: 'toTOON' });
    ok(!text.startsWith('ERROR:'));
    match(text, /symbol:toTOON/);
    ok(text.includes('risk:'), 'should report risk level');
    ok(text.includes('direct_importers:') || text.includes('direct:'), 'should show importers');
  });
});

describe('loom_hybrid_search', () => {
  it('returns hybrid search results', async () => {
    const text = await client.callTool('loom_hybrid_search', { query: 'toTOON' });
    ok(!text.startsWith('ERROR:'));
    match(text, /query:toTOON/);
    match(text, /results:\d+/);
  });

  it('respects mode parameter', async () => {
    const text = await client.callTool('loom_hybrid_search', { query: 'to', mode: 'keyword' });
    match(text, /mode:keyword/);
  });
});

describe('loom_remember and loom_recall', () => {
  it('stores and retrieves memory', async () => {
    const store = await client.callTool('loom_remember', { entity: 'test_symbol', summary: 'A test insight' });
    ok(!store.startsWith('ERROR:'));
    match(store, /remembered:test_symbol/);

    const recall = await client.callTool('loom_recall', { query: 'test' });
    ok(!recall.startsWith('ERROR:'));
    match(recall, /query:test/);
  });
});

describe('loom_session_compress', () => {
  it('sets compression mode', async () => {
    const text = await client.callTool('loom_session_compress', { mode: 'debug' });
    ok(!text.startsWith('ERROR:'));
    match(text, /compression_mode:debug/);
  });

  it('supports all modes', async () => {
    for (const mode of ['feature', 'review', 'explore']) {
      const text = await client.callTool('loom_session_compress', { mode });
      match(text, new RegExp(`compression_mode:${mode}`));
    }
  });
});

describe('loom_diff_compress', () => {
  it('returns git diff stats', async () => {
    const text = await client.callTool('loom_diff_compress', { since: 'HEAD~1' });
    ok(!text.startsWith('ERROR:') || text.includes('git_not_available'), 'should return diff or error');
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

describe('loom_get_symbol', () => {
  it('retrieves symbol metadata', async () => {
    await client.callTool('loom_get_topology', { dir: 'src' });
    const text = await client.callTool('loom_get_symbol', { symbol: 'toTOON' });
    ok(text.length > 0, 'should return content');
  });
});

describe('loom_get_symbol_importance', () => {
  it('returns importance score', async () => {
    const text = await client.callTool('loom_get_symbol_importance', { symbol: 'toTOON' });
    ok(!text.startsWith('ERROR:'));
    match(text, /symbol:toTOON/);
    ok(text.includes('score:'), 'should show importance score');
  });
});

describe('loom_get_changed_symbols', () => {
  it('returns changed files', async () => {
    const text = await client.callTool('loom_get_changed_symbols');
    ok(!text.startsWith('ERROR:') || text.includes('changes:'), 'should return changes info');
  });
});

describe('loom_get_untested_symbols', () => {
  it('returns untested symbol list', async () => {
    const text = await client.callTool('loom_get_untested_symbols');
    ok(!text.startsWith('ERROR:'));
    ok(text.includes('untested_symbols:'), 'should report untested symbols');
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

describe('loom_get_deps', () => {
  it('builds dependency graph', async () => {
    const text = await client.callTool('loom_get_deps');
    ok(!text.startsWith('ERROR:'));
    ok(text.includes('nodes:') || text.includes('edges:'), 'should show graph stats');
  });

  it('supports DOT format', async () => {
    const text = await client.callTool('loom_get_deps', { format: 'dot' });
    ok(!text.startsWith('ERROR:') || text.includes('digraph'), 'should return DOT format');
  });
});

describe('loom_get_metrics', () => {
  it('returns session metrics', async () => {
    const text = await client.callTool('loom_get_metrics');
    ok(!text.startsWith('ERROR:'));
    match(text, /session:/);
    ok(text.includes('turns:') || text.includes('tokens_used:'), 'should show metrics');
  });

  it('shows tool breakdown when requested', async () => {
    const text = await client.callTool('loom_get_metrics', { breakdown: true });
    ok(!text.startsWith('ERROR:'));
    ok(text.includes('tool_breakdown:') || text.includes('loom_'), 'should show breakdown');
  });
});

describe('loom_get_sessions', () => {
  it('returns session history', async () => {
    const text = await client.callTool('loom_get_sessions', { limit: 5 });
    ok(!text.startsWith('ERROR:') || text.includes('no_sessions'), 'should return history or none');
  });
});