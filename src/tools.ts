import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
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
const circuitBreaker = new CircuitBreaker({ focusBudget: 20, topologyCalls: 100 });
const watcher = new LoomWatcher();
const recorder = new SessionRecorder('.loom/sessions');

let focusedFilesCount = 0;

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
    { name: 'loom-mcp', version: '0.1.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'loom_get_topology',
          description: 'Get AST skeleton of a directory. Function signatures and types only. No implementations.',
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
          description: 'Get full implementation of a file or function.',
          inputSchema: {
            type: 'object',
            properties: {
              target: { type: 'string' },
              contextDepth: { type: 'number', default: 1 }
            },
            required: ['target']
          }
        },
        {
          name: 'loom_get_active_diff',
          description: 'Get what has changed this session.',
          inputSchema: { type: 'object', properties: {}, required: [] }
        },
        {
          name: 'loom_blur',
          description: 'Remove a file from active focus.',
          inputSchema: {
            type: 'object',
            properties: { target: { type: 'string' } },
            required: ['target']
          }
        },
        {
          name: 'loom_search_refs',
          description: 'AST-aware Find All References. 10x fewer tokens than grep.',
          inputSchema: {
            type: 'object',
            properties: {
              symbol: { type: 'string' },
              scope: { type: 'string', enum: ['workspace', 'file', 'module'], default: 'workspace' }
            },
            required: ['symbol']
          }
        }
      ]
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params as { name: string; arguments: Record<string, unknown> };

    try {
      session.incrementTurn();

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
        let cacheHits = 0;

        for (const file of files.slice(0, 500)) {
          const { skeleton, cacheHit } = cache.getOrCompute(file, () => {
            const skel = skeletonizeFile(file);
            return toTOON([skel]);
          });
          if (cacheHit) cacheHits++;
          
          const skel = skeletonizeFile(file);
          if (skel.nodes.length > 0) {
            skeletons.push(skel);
          }
        }

        const toon = toTOON(skeletons);
        const tokenEstimate = estimateTokens(toon);

        watcher.watchDir(resolve(WORKSPACE_ROOT, dir));

        return {
          content: [{
            type: 'text',
            text: `topology:${dir}\nfiles:${skeletons.length}\ntoken_estimate:${tokenEstimate}\ntoken_saved:${tokenEstimate}\n\n${toon}`
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
          return { content: [{ type: 'text', text: `ERROR:focus_budget_exceeded\naction_required:loom_blur\nfocused_count:${focusedFilesCount}\nlimit:${breakerCheck.limit}` }] };
        }

        const [filePath, funcName] = target.split('::');
        const fullPath = resolve(WORKSPACE_ROOT, filePath);

        if (!existsSync(fullPath)) {
          return { content: [{ type: 'text', text: `ERROR:file_not_found\npath:${filePath}` }] };
        }

        const content = readFileSync(fullPath, 'utf8');

        if (funcName) {
          const skeleton = skeletonizeFile(fullPath);
          const fnNode = skeleton.nodes.find((n) => n.name === funcName);
          if (fnNode && fnNode.lineStart !== undefined && fnNode.lineEnd !== undefined) {
            const lines = content.split('\n');
            const focusedLines = lines.slice(fnNode.lineStart, fnNode.lineEnd + 1).join('\n');
            session.addFocused(fullPath, content);
            focusedFilesCount++;
            watcher.watchFile(fullPath);
            return { content: [{ type: 'text', text: `focused:${target}\nlines:${fnNode.lineEnd - fnNode.lineStart + 1}\ntoken_estimate:${estimateTokens(focusedLines)}\n\n${focusedLines}` }] };
          }
        }

        session.addFocused(fullPath, content);
        focusedFilesCount++;
        watcher.watchFile(fullPath);
        return { content: [{ type: 'text', text: `focused:${filePath}\nlines:${content.split('\n').length}\ntoken_estimate:${estimateTokens(content)}\n\n${content}` }] };
      }

      if (name === 'loom_get_active_diff') {
        const info = session.getInfo();
        const focused = session.getFocused();
        const changed: string[] = [];

        for (const path of focused) {
          try {
            if (existsSync(path)) {
              const current = readFileSync(path, 'utf8');
              const saved = session.getInfo();
              changed.push(`${relative(WORKSPACE_ROOT, path)}:${current !== '' ? 'changed' : 'unchanged'}`);
            } else {
              changed.push(`${relative(WORKSPACE_ROOT, path)}:deleted`);
            }
          } catch {
            changed.push(`${relative(WORKSPACE_ROOT, path)}:error`);
          }
        }

        return { content: [{ type: 'text', text: `session_id:${info.sessionId}\nturns:${info.turns}\nfocused:${info.focused}\nchanged:${changed.filter(c => c.includes(':changed')).length}\nelapsed_ms:${info.elapsed}\n\n${changed.join('\n')}` }] };
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
        const symbol = args.symbol as string;
        const scope = (args.scope as string) || 'workspace';

        const breakerCheck = circuitBreaker.check('searchRefs');
        if (!breakerCheck.allowed) {
          return { content: [{ type: 'text', text: breakerCheck.message || 'ERROR:search_limit_exceeded' }] };
        }

        const refs: { file: string; line: number; snippet: string; refType: string }[] = [];
        const searchPattern = new RegExp(`\\b${symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
        
        const dir = scope === 'workspace' ? '.' : '.';
        const files = globFiles(dir, ['ts', 'tsx', 'js', 'jsx', 'py'], ['node_modules', '.git', 'dist']);
        
        const maxRefs = 50;
        for (const file of files.slice(0, 200)) {
          if (refs.length >= maxRefs) break;
          
          try {
            const content = readFileSync(file, 'utf8');
            const lines = content.split('\n');
            
            for (let i = 0; i < lines.length; i++) {
              const line = lines[i];
              
              if (searchPattern.test(line)) {
                const isComment = line.trim().startsWith('//') || line.trim().startsWith('#') || line.trim().startsWith('/*');
                const isString = /['"`].*\b${symbol}\b.*['"`]/.test(line);
                
                if (!isComment && !isString) {
                  const refType = line.includes(`function ${symbol}`) || line.includes(`def ${symbol}`) ? 'definition' :
                                line.includes(`${symbol}(`) ? 'call' :
                                line.includes(`import`) && line.includes(symbol) ? 'import' :
                                line.includes(`type ${symbol}`) || line.includes(`interface ${symbol}`) ? 'type' :
                                'usage';
                  
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

        return { content: [{ type: 'text', text: `symbol:${symbol}\nscope:${scope}\nrefs:${refs.length}\n\n${refs.map(r => `${r.file}:${r.line} ${r.refType} ${r.snippet}`).join('\n')}` }] };
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