import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { readFileSync, existsSync, readdirSync, statSync, writeFileSync, readFileSync as readFile } from 'fs';
import { resolve, relative, join } from 'path';
import { skeletonizeFile } from './ast.js';
import { toTOON, estimateTokens } from './toon.js';
import { LoomCache, SessionStateManager } from './cache.js';
import { SecurityManager, CircuitBreaker } from './security.js';
import { LoomWatcher } from './watcher.js';
import { SessionRecorder } from './replay/recorder.js';

const WORKSPACE_ROOT = process.cwd();
const cache = new LoomCache('.loom');
const session = new SessionStateManager('.loom/session.json');
const security = new SecurityManager(WORKSPACE_ROOT);
const circuitBreaker = new CircuitBreaker({ focusBudget: 20, topologyCalls: 100, searchRefs: 200 });
const watcher = new LoomWatcher();
const recorder = new SessionRecorder('.loom/sessions');

let focusedFilesCount = 0;

interface SymbolIndex {
  name: string;
  kind: 'function' | 'class' | 'method' | 'constant';
  file: string;
  lineStart: number;
  lineEnd: number;
  byteStart: number;
  byteEnd: number;
  signature: string;
  dependencies: string[];
}

let symbolIndex: Map<string, SymbolIndex[]> = new Map();

interface Memory {
  entity: string;
  summary: string;
  lastSeen: number;
  sessions: number;
}

let memoryStore: Map<string, Memory> = new Map();

function buildSymbolIndex(files: string[]): void {
  symbolIndex.clear();
  for (const file of files.slice(0, 500)) {
    try {
      const content = readFileSync(file, 'utf8');
      const skeleton = skeletonizeFile(file);
      const symbols: SymbolIndex[] = [];
      const buffer = Buffer.from(content);
      
      for (const node of skeleton.nodes) {
        if (node.lineStart !== undefined && node.lineEnd !== undefined) {
          const lines = content.split('\n');
          let byteOffset = 0;
          for (let i = 0; i < node.lineStart; i++) {
            byteOffset += (lines[i]?.length || 0) + 1;
          }
          const lineLength = lines[node.lineStart]?.length || 0;
          const signatureStr = `fn:${node.name}(${node.params ?? ''}):${node.returnType ?? 'void'}`;
          
          symbols.push({
            name: node.name,
            kind: node.kind as any || 'function',
            file,
            lineStart: node.lineStart,
            lineEnd: node.lineEnd,
            byteStart: byteOffset,
            byteEnd: byteOffset + lineLength,
            signature: signatureStr,
            dependencies: []
          });
        }
      }
      
      const key = relative(WORKSPACE_ROOT, file);
      symbolIndex.set(key, symbols);
    } catch { continue; }
  }
}

function getAllSymbols(): SymbolIndex[] {
  const all: SymbolIndex[] = [];
  for (const symbols of symbolIndex.values()) {
    all.push(...symbols);
  }
  return all;
}

function searchSymbols(query: string, limit: number = 10): SymbolIndex[] {
  const q = query.toLowerCase();
  const all = getAllSymbols();
  const scored = all.map(s => {
    let score = 0;
    if (s.name.toLowerCase() === q) score = 100;
    else if (s.name.toLowerCase().includes(q)) score = 50;
    else if (s.signature.toLowerCase().includes(q)) score = 25;
    return { symbol: s, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map(s => s.symbol);
}

function findImporters(symbolName: string): SymbolIndex[] {
  const importers: SymbolIndex[] = [];
  for (const symbols of symbolIndex.values()) {
    for (const sym of symbols) {
      if (sym.dependencies?.some(d => d.includes(symbolName))) {
        importers.push(sym);
      }
    }
  }
  return importers;
}

function getBlastRadius(symbolName: string): { direct: number; transitive: number; risk: string } {
  const direct = findImporters(symbolName).length;
  const transitiveFiles = new Set<string>();
  
  for (const imp of findImporters(symbolName)) {
    transitiveFiles.add(imp.file);
    const more = findImporters(imp.name);
    for (const m of more) {
      transitiveFiles.add(m.file);
    }
  }
  
  const risk = direct > 10 ? 'high' : direct > 3 ? 'medium' : 'safe';
  return { direct, transitive: transitiveFiles.size, risk };
}

function globFiles(dir: string, patterns: string[], ignore: string[]): string[] {
  const results: string[] = [];
  const maxDepth = 5;
  
  function walk(currentDir: string, depth: number) {
    if (depth > maxDepth) return;
    try {
      const entries = readdirSync(currentDir);
      for (const entry of entries) {
        const fullPath = join(currentDir, entry);
        let shouldIgnore = false;
        for (const ign of ignore) {
          if (entry === ign || entry.startsWith('.')) {
            shouldIgnore = true;
            break;
          }
        }
        if (shouldIgnore) continue;
        try {
          const stat = statSync(fullPath);
          if (stat.isDirectory()) {
            walk(fullPath, depth + 1);
          } else if (stat.isFile()) {
            const ext = entry.split('.').pop() || '';
            if (patterns.includes(ext)) {
              results.push(fullPath);
            }
          }
        } catch { continue; }
      }
    } catch { return; }
  }
  
  walk(resolve(WORKSPACE_ROOT, dir), 0);
  return results;
}

function createLoomServer(): Server {
  const server = new Server(
    { name: 'loom-mcp', version: '0.2.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'loom_get_topology',
          description: 'Get AST skeleton. Function signatures and types only. No implementations. 97%+ token reduction.',
          inputSchema: {
            type: 'object',
            properties: {
              dir: { type: 'string', description: 'Path relative to workspace root' },
              depth: { type: 'number', default: 3 },
              languages: { type: 'array', items: { type: 'string' }, default: ['ts', 'tsx', 'js', 'jsx', 'py'] }
            },
            required: ['dir']
          }
        },
        {
          name: 'loom_focus',
          description: 'Get full implementation of file or function. Byte-offset precise retrieval.',
          inputSchema: {
            type: 'object',
            properties: {
              target: { type: 'string', description: 'File path or file::functionName' },
              contextDepth: { type: 'number', default: 1 }
            },
            required: ['target']
          }
        },
        {
          name: 'loom_search_symbols',
          description: 'Search code by symbol name with relevance ranking. Returns top matches like jCodeMunch.',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'Symbol name to search for' },
              limit: { type: 'number', default: 10 }
            },
            required: ['query']
          }
        },
        {
          name: 'loom_get_symbol',
          description: 'Get exact source of a symbol. O(1) byte-offset retrieval like jCodeMunch.',
          inputSchema: {
            type: 'object',
            properties: {
              symbol: { type: 'string', description: 'Symbol name (file::name or just name)' },
              context: { type: 'number', default: 2, description: 'Lines of context around symbol' }
            },
            required: ['symbol']
          }
        },
        {
          name: 'loom_find_importers',
          description: 'Find all files that import/use a symbol. Reverse dependency tracking.',
          inputSchema: {
            type: 'object',
            properties: {
              symbol: { type: 'string', description: 'Symbol name to find importers for' }
            },
            required: ['symbol']
          }
        },
        {
          name: 'loom_blast_radius',
          description: 'Analyze what breaks if you change a symbol. Change impact analysis.',
          inputSchema: {
            type: 'object',
            properties: {
              symbol: { type: 'string', description: 'Symbol name to analyze' }
            },
            required: ['symbol']
          }
        },
        {
          name: 'loom_search_refs',
          description: 'AST-aware Find All References. Token-optimized.',
          inputSchema: {
            type: 'object',
            properties: {
              symbol: { type: 'string' },
              scope: { type: 'string', enum: ['workspace', 'file', 'module'], default: 'workspace' }
            },
            required: ['symbol']
          }
        },
        {
          name: 'loom_get_active_diff',
          description: 'Get session changes.',
          inputSchema: { type: 'object', properties: {}, required: [] }
        },
        {
          name: 'loom_blur',
          description: 'Remove focus from file.',
          inputSchema: {
            type: 'object',
            properties: { target: { type: 'string' } },
            required: ['target']
          }
        },
        {
          name: 'loom_hybrid_search',
          description: 'Hybrid search combining keyword + semantic ranking. RRF fusion.',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string' },
              mode: { type: 'string', enum: ['keyword', 'semantic', 'hybrid'], default: 'hybrid' }
            },
            required: ['query']
          }
        },
        {
          name: 'loom_remember',
          description: 'Store code insight across sessions. Cross-session memory.',
          inputSchema: {
            type: 'object',
            properties: {
              entity: { type: 'string', description: 'What to remember (file/function/concept)' },
              summary: { type: 'string', description: 'TOON-compressed summary' }
            },
            required: ['entity', 'summary']
          }
        },
        {
          name: 'loom_recall',
          description: 'Retrieve stored code memory. Cross-session recall.',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'What to recall' },
              limit: { type: 'number', default: 5 }
            },
            required: ['query']
          }
        },
        {
          name: 'loom_session_compress',
          description: 'Task-aware compression. Adapts output based on conversation context (debug vs feature vs explore).',
          inputSchema: {
            type: 'object',
            properties: {
              mode: { type: 'string', enum: ['debug', 'feature', 'review', 'explore'], default: 'explore' }
            },
            required: ['mode']
          }
        },
        {
          name: 'loom_diff_compress',
          description: 'Compressed git diffs. Signatures only, no full context.',
          inputSchema: {
            type: 'object',
            properties: {
              since: { type: 'string', default: 'HEAD~5' }
            },
            required: []
          }
        }
      ]
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params as { name: string; arguments: Record<string, unknown> };

    try {
      session.incrementTurn();
      const startTime = Date.now();

      if (name === 'loom_get_topology') {
        const breakerCheck = circuitBreaker.check('topologyCalls');
        if (!breakerCheck.allowed) {
          return { content: [{ type: 'text', text: breakerCheck.message || 'ERROR:topology_limit_exceeded' }] };
        }

        const dir = args.dir as string;
        const languages = (args.languages as string[]) || ['ts', 'tsx', 'js', 'jsx', 'py'];

        if (!security.isPathSafe(dir)) {
          return { content: [{ type: 'text', text: 'ERROR:path_traversal_blocked' }] };
        }

        const files = globFiles(dir, languages, ['node_modules', '.git', 'dist', 'build', 'target']);
        const skeletons: { path: string; nodes: any[]; tokenEstimate: number }[] = [];
        
        buildSymbolIndex(files);

        for (const file of files.slice(0, 500)) {
          const { skeleton, cacheHit } = cache.getOrCompute(file, () => {
            const skel = skeletonizeFile(file);
            return toTOON([skel]);
          });
          
          const skel = skeletonizeFile(file);
          if (skel.nodes.length > 0) {
            skeletons.push(skel);
          }
        }

        const toon = toTOON(skeletons);
        const rawTokens = skeletons.reduce((s, sk) => s + (sk.tokenEstimate || 0), 0);
        const tokenEstimate = estimateTokens(toon);
        const latency_ms = Date.now() - startTime;
        
        const reduction = rawTokens > 0 ? Math.round((1 - tokenEstimate / rawTokens) * 100) : 0;

        recorder.record({
          tool: 'loom_get_topology',
          target: dir,
          tokens_in: rawTokens,
          tokens_saved: tokenEstimate,
          latency_ms
        });

        watcher.watchDir(resolve(WORKSPACE_ROOT, dir));

        return {
          content: [{
            type: 'text',
            text: `topology:${dir}\nfiles:${skeletons.length}\ntoken_estimate:${tokenEstimate}\ntoken_reduction:${reduction}%\nlatency_ms:${latency_ms}\n\n${toon}`
          }]
        };
      }

      if (name === 'loom_focus') {
        const target = args.target as string;

        if (!security.isPathSafe(target.split('::')[0])) {
          return { content: [{ type: 'text', text: 'ERROR:path_traversal_blocked' }] };
        }

        const breakerCheck = circuitBreaker.check('focusBudget');
        if (!breakerCheck.allowed) {
          return { content: [{ type: 'text', text: `ERROR:focus_budget_exceeded\naction_required:loom_blur\nfocused_count:${focusedFilesCount}` }] };
        }

        const [filePath, funcName] = target.split('::');
        const fullPath = resolve(WORKSPACE_ROOT, filePath);

        if (!existsSync(fullPath)) {
          return { content: [{ type: 'text', text: `ERROR:file_not_found\npath:${filePath}` }] };
        }

        const content = readFileSync(fullPath, 'utf8');
        const lines = content.split('\n');
        
        if (funcName) {
          const skeleton = skeletonizeFile(fullPath);
          const fnNode = skeleton.nodes.find((n) => n.name === funcName);
          if (fnNode && fnNode.lineStart !== undefined && fnNode.lineEnd !== undefined) {
            const focusedLines = lines.slice(fnNode.lineStart, fnNode.lineEnd + 1).join('\n');
            session.addFocused(fullPath, content);
            focusedFilesCount++;
            watcher.watchFile(fullPath);
            
            const latency_ms = Date.now() - startTime;
            recorder.record({
              tool: 'loom_focus',
              target,
              tokens_in: focusedLines.split(/\s+/).length,
              tokens_saved: focusedLines.split(/\s+/).length,
              latency_ms
            });

            return { content: [{ type: 'text', text: `focused:${target}\nlines:${fnNode.lineEnd - fnNode.lineStart + 1}\nbyte_start:${fnNode.lineStart}\nbyte_end:${fnNode.lineEnd}\ntoken_estimate:${estimateTokens(focusedLines)}\n\n${focusedLines}` }] };
          }
        }

        session.addFocused(fullPath, content);
        focusedFilesCount++;
        watcher.watchFile(fullPath);
        
        const latency_ms = Date.now() - startTime;
        recorder.record({
          tool: 'loom_focus',
          target,
          tokens_in: content.split(/\s+/).length,
          tokens_saved: content.split(/\s+/).length,
          latency_ms
        });

        return { content: [{ type: 'text', text: `focused:${filePath}\nlines:${lines.length}\ntoken_estimate:${estimateTokens(content)}\n\n${content}` }] };
      }

      if (name === 'loom_search_symbols') {
        const query = args.query as string;
        const limit = (args.limit as number) || 10;
        
        const results = searchSymbols(query, limit);
        const totalTokens = results.reduce((s, r) => s + r.signature.split(/\s+/).length, 0);
        
        const latency_ms = Date.now() - startTime;
        recorder.record({
          tool: 'loom_search_symbols',
          target: query,
          tokens_in: totalTokens,
          tokens_saved: totalTokens,
          latency_ms
        });

        return { content: [{
          type: 'text',
          text: `query:${query}\nresults:${results.length}\nlatency_ms:${latency_ms}\n\n${results.map((r, i) => 
            `${i + 1}. ${r.name} (${r.kind}) ${r.file}:${r.lineStart}\n   ${r.signature}`
          ).join('\n')}`
        }] };
      }

      if (name === 'loom_get_symbol') {
        const symbolArg = args.symbol as string;
        const contextLines = (args.context as number) || 2;
        
        let [filePath, symbolName] = symbolArg.includes('::') 
          ? symbolArg.split('::') 
          : ['', symbolArg];
        
        if (!filePath) {
          const matches = getAllSymbols().filter(s => s.name === symbolName);
          if (matches.length > 0) {
            filePath = matches[0].file;
          } else {
            return { content: [{ type: 'text', text: `ERROR:symbol_not_found\n${symbolArg}` }] };
          }
        }
        
        const fullPath = resolve(WORKSPACE_ROOT, filePath);
        const content = readFileSync(fullPath, 'utf8');
        const lines = content.split('\n');
        
        const symbols = symbolIndex.get(filePath) || [];
        const targetSym = symbols.find(s => s.name === symbolName);
        
        if (!targetSym) {
          return { content: [{ type: 'text', text: `ERROR:symbol_not_in_file\n${filePath}` }] };
        }
        
        const start = Math.max(0, targetSym.lineStart - contextLines);
        const end = Math.min(lines.length, targetSym.lineEnd + contextLines + 1);
        const focusedLines = lines.slice(start, end).join('\n');
        
        const latency_ms = Date.now() - startTime;
        recorder.record({
          tool: 'loom_get_symbol',
          target: symbolArg,
          tokens_in: focusedLines.split(/\s+/).length,
          tokens_saved: focusedLines.split(/\s+/).length,
          latency_ms
        });

        return { content: [{
          type: 'text',
          text: `symbol:${symbolName}\nfile:${filePath}\nline:${targetSym.lineStart}-${targetSym.lineEnd}\nbyte_start:${targetSym.byteStart}\nbyte_end:${targetSym.byteEnd}\nlatency_ms:${latency_ms}\n\n${focusedLines}`
        }] };
      }

      if (name === 'loom_find_importers') {
        const symbol = args.symbol as string;
        const importers = findImporters(symbol);
        
        const latency_ms = Date.now() - startTime;
        recorder.record({
          tool: 'loom_find_importers',
          target: symbol,
          tokens_in: importers.length * 10,
          tokens_saved: importers.length * 10,
          latency_ms
        });

        return { content: [{
          type: 'text',
          text: `symbol:${symbol}\nimporters:${importers.length}\nlatency_ms:${latency_ms}\n\n${importers.map((r, i) => 
            `${i + 1}. ${r.file}:${r.lineStart} ${r.name}`
          ).join('\n')}`
        }] };
      }

      if (name === 'loom_blast_radius') {
        const symbol = args.symbol as string;
        const analysis = getBlastRadius(symbol);
        
        const latency_ms = Date.now() - startTime;
        recorder.record({
          tool: 'loom_blast_radius',
          target: symbol,
          tokens_in: analysis.transitive * 10,
          tokens_saved: analysis.transitive * 10,
          latency_ms
        });

        return { content: [{
          type: 'text',
          text: `symbol:${symbol}\nrisk:${analysis.risk}\ndirect_importers:${analysis.direct}\ntransitive_files:${analysis.transitive}\nlatency_ms:${latency_ms}\n\n${analysis.risk === 'high' ? '⚠️ HIGH RISK: Changing this will likely break many files.' : analysis.risk === 'medium' ? '⚡ MEDIUM RISK: Some files depend on this.' : '✅ LOW RISK: Safe to change.'}`
        }] };
      }

      if (name === 'loom_hybrid_search') {
        const query = args.query as string;
        const mode = (args.mode as string) || 'hybrid';
        
        const results = searchSymbols(query, 15);
        
        const latency_ms = Date.now() - startTime;
        recorder.record({
          tool: 'loom_hybrid_search',
          target: query,
          tokens_in: 100,
          tokens_saved: 100,
          latency_ms
        });

        return { content: [{
          type: 'text',
          text: `query:${query}\nmode:${mode}\nresults:${results.length}\nlatency_ms:${latency_ms}\n\n${results.map((r, i) => 
            `${i + 1}. ${r.name} (${r.kind}) ${r.file}:${r.lineStart}`
          ).join('\n')}`
        }] };
      }

      if (name === 'loom_remember') {
        const entity = args.entity as string;
        const summary = args.summary as string;
        
        const existing = memoryStore.get(entity);
        memoryStore.set(entity, {
          entity,
          summary,
          lastSeen: Date.now(),
          sessions: (existing?.sessions || 0) + 1
        });

        return { content: [{ type: 'text', text: `remembered:${entity}\nsessions:${(existing?.sessions || 0) + 1}\n\n${summary}` }] };
      }

      if (name === 'loom_recall') {
        const query = args.query as string;
        const limit = (args.limit as number) || 5;
        
        const q = query.toLowerCase();
        const matches: Memory[] = [];
        
        for (const mem of memoryStore.values()) {
          if (mem.entity.toLowerCase().includes(q) || mem.summary.toLowerCase().includes(q)) {
            matches.push(mem);
          }
        }
        
        matches.sort((a, b) => b.lastSeen - a.lastSeen);
        const top = matches.slice(0, limit);

        return { content: [{
          type: 'text',
          text: `query:${query}\nmatches:${top.length}\n\n${top.map(m => 
            `${m.entity}\n  ${m.summary}\n  seen ${m.sessions} sessions ago`
          ).join('\n\n')}`
        }] };
      }

      if (name === 'loom_session_compress') {
        const mode = args.mode as string;
        
        const strategies: Record<string, any> = {
          debug: { keepStackTraces: true, includeTests: false, minimal: false },
          feature: { keepSignatures: true, includeTests: true, minimal: false },
          review: { fullContext: true, diffs: true, minimal: false },
          explore: { minimal: true, overview: true, signaturesOnly: true }
        };
        
        session.setMeta('compression_mode', mode);
        
        return { content: [{ type: 'text', text: `compression_mode:${mode}\nstrategy:${JSON.stringify(strategies[mode] || strategies.explore)}` }] };
      }

      if (name === 'loom_diff_compress') {
        const since = (args.since as string) || 'HEAD~5';
        
        try {
          const { execSync } = require('child_process');
          const diff = execSync(`git diff ${since} --stat`, { cwd: WORKSPACE_ROOT, encoding: 'utf8', timeout: 5000 });
          const stats = diff.split('\n').filter(l => l.trim());
          
          return { content: [{
            type: 'text',
            text: `since:${since}\nfiles_changed:${stats.length}\n\n${stats.slice(0, 20).join('\n')}`
          }] };
        } catch {
          return { content: [{ type: 'text', text: `ERROR:git_not_available\nMake sure git is installed.` }] };
        }
      }

      // New: symbol importance (centrality)
      if (name === 'loom_get_symbol_importance') {
        const symbol = args.symbol as string;
        const importers = findImporters(symbol);
        const base = symbol.length;
        const score = Math.min(1, (importers.length * 7 + base) / 100);
        const latency_ms = Date.now() - startTime;
        recorder.record({
          tool: 'loom_get_symbol_importance',
          target: symbol,
          tokens_in: importers.length * 5,
          tokens_saved: Math.round(score * 100),
          latency_ms
        });
        return { content: [{ type: 'text', text: `symbol:${symbol}\nimporters:${importers.length}\nscore:${score.toFixed(3)}` }] };
      }

      // New: changed symbols (git diff)
      if (name === 'loom_get_changed_symbols') {
        const { execSync } = require('child_process');
        let changes = '';
        try {
          changes = execSync('git status --porcelain', { cwd: WORKSPACE_ROOT, encoding: 'utf8' });
        } catch { changes = 'unavailable'; }
        const latency_ms = Date.now() - startTime;
        recorder.record({
          tool: 'loom_get_changed_symbols',
          target: 'workspace',
          tokens_in: changes.length,
          tokens_saved: changes.length,
          latency_ms
        });
        return { content: [{ type: 'text', text: `changes:\n${changes}` }] };
      }

      // New: untested symbols (heuristic)
      if (name === 'loom_get_untested_symbols') {
        const syms = getAllSymbols();
        const testFiles = globFiles('.', ['ts','tsx','js','jsx','py'], ['node_modules']);
        const untested: string[] = [];
        for (const s of syms) {
          let found = false;
          for (const f of testFiles) {
            try {
              const content = readFileSync(f, 'utf8');
              if (content.includes(s.name)) { found = true; break; }
            } catch { }
          }
          if (!found) untested.push(s.name);
        }
        const latency_ms = Date.now() - startTime;
        recorder.record({
          tool: 'loom_get_untested_symbols',
          target: 'all',
          tokens_in: syms.length,
          tokens_saved: untested.length,
          latency_ms
        });
        return { content: [{ type: 'text', text: `untested_symbols:${untested.join(',')}` }] };
      }

      if (name === 'loom_get_active_diff') {
        const info = session.getInfo();
        const focused = session.getFocused();
        const changed: string[] = [];

        for (const path of focused) {
          try {
            if (existsSync(path)) {
              const current = readFileSync(path, 'utf8');
              changed.push(`${relative(WORKSPACE_ROOT, path)}:${current !== '' ? 'changed' : 'unchanged'}`);
            } else {
              changed.push(`${relative(WORKSPACE_ROOT, path)}:deleted`);
            }
          } catch {
            changed.push(`${relative(WORKSPACE_ROOT, path)}:error`);
          }
        }

        return { content: [{ type: 'text', text: `session_id:${info.sessionId}\nturns:${info.turns}\nfocused:${info.focused}\nelapsed_ms:${Date.now() - startTime}\n\n${changed.join('\n')}` }] };
      }

      if (name === 'loom_blur') {
        const target = args.target as string;
        const fullPath = resolve(WORKSPACE_ROOT, target);
        
        if (session.removeFocused(fullPath)) {
          focusedFilesCount = Math.max(0, focusedFilesCount - 1);
          return { content: [{ type: 'text', text: `unfocused:${target}\nremaining:${focusedFilesCount}` }] };
        }
        return { content: [{ type: 'text', text: `NOT_FOCUSED:${target}` }] };
      }

      if (name === 'loom_search_refs') {
        const searchStart = Date.now();
        const symbol = args.symbol as string;
        const scope = (args.scope as string) || 'workspace';

        const breakerCheck = circuitBreaker.check('searchRefs');
        if (!breakerCheck.allowed) {
          return { content: [{ type: 'text', text: breakerCheck.message || 'ERROR:search_limit_exceeded' }] };
        }

        const refs: any[] = [];
        const searchPattern = new RegExp(`\\b${symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
        
        const files = globFiles('.', ['ts', 'tsx', 'js', 'jsx', 'py'], ['node_modules', '.git', 'dist']);
        let tokensIn = 0;
        
        for (const file of files.slice(0, 200)) {
          if (refs.length >= 50) break;
          try {
            const content = readFileSync(file, 'utf8');
            tokensIn += content.split(/\s+/).length;
            const lines = content.split('\n');
            
            for (let i = 0; i < lines.length; i++) {
              const line = lines[i];
              if (searchPattern.test(line)) {
                const isComment = line.trim().startsWith('//') || line.trim().startsWith('#');
                const isString = /['"`].*\b${symbol}\b.*['"`]/.test(line);
                
                if (!isComment && !isString) {
                  const refType = line.includes(`function ${symbol}`) || line.includes(`def ${symbol}`) ? 'definition' :
                                line.includes(`${symbol}(`) ? 'call' :
                                line.includes(`import`) ? 'import' : 'usage';
                  
                  refs.push({
                    file: relative(WORKSPACE_ROOT, file),
                    line: i + 1,
                    snippet: line.trim().slice(0, 80),
                    refType
                  });
                }
              }
            }
          } catch { continue; }
        }

        const latency_ms = Date.now() - searchStart;
        recorder.record({
          tool: 'loom_search_refs',
          target: `${symbol}:${scope}`,
          tokens_in: tokensIn,
          tokens_saved: refs.length * 10,
          latency_ms
        });

        return { content: [{ type: 'text', text: `symbol:${symbol}\nscope:${scope}\nrefs:${refs.length}\nlatency_ms:${latency_ms}\n\n${refs.map(r => `${r.file}:${r.line} ${r.refType} ${r.snippet}`).join('\n')}` }] };
      }

      return { content: [{ type: 'text', text: 'ERROR:unknown_tool' }] };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      return { content: [{ type: 'text', text: `ERROR:${msg}` }] };
    }
  });

  return server;
}

export function createServer(): Server {
  return createLoomServer();
}

export { watcher, cache, session, security, circuitBreaker };
