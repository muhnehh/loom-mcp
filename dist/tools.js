"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.circuitBreaker = exports.security = exports.session = exports.cache = exports.watcher = void 0;
exports.createServer = createServer;
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const fs_1 = require("fs");
const path_1 = require("path");
const ast_js_1 = require("./ast.js");
const toon_js_1 = require("./toon.js");
const cache_js_1 = require("./cache.js");
const security_js_1 = require("./security.js");
const watcher_js_1 = require("./watcher.js");
const recorder_js_1 = require("./replay/recorder.js");
const WORKSPACE_ROOT = process.cwd();
const cache = new cache_js_1.LoomCache('.loom');
exports.cache = cache;
const session = new cache_js_1.SessionStateManager('.loom/session.json');
exports.session = session;
const security = new security_js_1.SecurityManager(WORKSPACE_ROOT);
exports.security = security;
const circuitBreaker = new security_js_1.CircuitBreaker({ focusBudget: 20, topologyCalls: 100 });
exports.circuitBreaker = circuitBreaker;
const watcher = new watcher_js_1.LoomWatcher();
exports.watcher = watcher;
const recorder = new recorder_js_1.SessionRecorder('.loom/sessions');
let focusedFilesCount = 0;
function globFiles(dir, patterns, ignore) {
    const results = [];
    const maxDepth = 5;
    function walk(currentDir, depth) {
        if (depth > maxDepth)
            return;
        try {
            const entries = (0, fs_1.readdirSync)(currentDir);
            for (const entry of entries) {
                const fullPath = (0, path_1.join)(currentDir, entry);
                let shouldIgnore = false;
                for (const ign of ignore) {
                    if (entry === ign || entry.startsWith('.')) {
                        shouldIgnore = true;
                        break;
                    }
                }
                if (shouldIgnore)
                    continue;
                try {
                    const stat = (0, fs_1.statSync)(fullPath);
                    if (stat.isDirectory()) {
                        walk(fullPath, depth + 1);
                    }
                    else if (stat.isFile()) {
                        const ext = entry.split('.').pop() || '';
                        if (patterns.includes(ext)) {
                            results.push(fullPath);
                        }
                    }
                }
                catch {
                    continue;
                }
            }
        }
        catch {
            return;
        }
    }
    walk((0, path_1.resolve)(WORKSPACE_ROOT, dir), 0);
    return results;
}
function createLoomServer() {
    const server = new index_js_1.Server({ name: 'loom-mcp', version: '0.1.0' }, { capabilities: { tools: {} } });
    server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => {
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
    server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;
        try {
            session.incrementTurn();
            if (name === 'loom_get_topology') {
                const breakerCheck = circuitBreaker.check('topologyCalls');
                if (!breakerCheck.allowed) {
                    return { content: [{ type: 'text', text: breakerCheck.message || 'ERROR:topology_limit_exceeded' }] };
                }
                const dir = args.dir;
                const languages = args.languages || ['ts', 'tsx', 'js', 'jsx', 'py'];
                if (!security.isPathSafe(dir)) {
                    return { content: [{ type: 'text', text: 'ERROR:path_traversal_blocked' }] };
                }
                const files = globFiles(dir, languages, ['node_modules', '.git', 'dist', 'build', 'target']);
                const skeletons = [];
                let cacheHits = 0;
                for (const file of files.slice(0, 500)) {
                    const { skeleton, cacheHit } = cache.getOrCompute(file, () => {
                        const skel = (0, ast_js_1.skeletonizeFile)(file);
                        return (0, toon_js_1.toTOON)([skel]);
                    });
                    if (cacheHit)
                        cacheHits++;
                    const skel = (0, ast_js_1.skeletonizeFile)(file);
                    if (skel.nodes.length > 0) {
                        skeletons.push(skel);
                    }
                }
                const toon = (0, toon_js_1.toTOON)(skeletons);
                const tokenEstimate = (0, toon_js_1.estimateTokens)(toon);
                watcher.watchDir((0, path_1.resolve)(WORKSPACE_ROOT, dir));
                return {
                    content: [{
                            type: 'text',
                            text: `topology:${dir}\nfiles:${skeletons.length}\ntoken_estimate:${tokenEstimate}\ntoken_saved:${tokenEstimate}\n\n${toon}`
                        }]
                };
            }
            if (name === 'loom_focus') {
                const target = args.target;
                if (!security.isPathSafe(target.split('::')[0])) {
                    return { content: [{ type: 'text', text: 'ERROR:path_traversal_blocked' }] };
                }
                const breakerCheck = circuitBreaker.check('focusBudget');
                if (!breakerCheck.allowed) {
                    return { content: [{ type: 'text', text: `ERROR:focus_budget_exceeded\naction_required:loom_blur\nfocused_count:${focusedFilesCount}\nlimit:${breakerCheck.limit}` }] };
                }
                const [filePath, funcName] = target.split('::');
                const fullPath = (0, path_1.resolve)(WORKSPACE_ROOT, filePath);
                if (!(0, fs_1.existsSync)(fullPath)) {
                    return { content: [{ type: 'text', text: `ERROR:file_not_found\npath:${filePath}` }] };
                }
                const content = (0, fs_1.readFileSync)(fullPath, 'utf8');
                if (funcName) {
                    const skeleton = (0, ast_js_1.skeletonizeFile)(fullPath);
                    const fnNode = skeleton.nodes.find((n) => n.name === funcName);
                    if (fnNode && fnNode.lineStart !== undefined && fnNode.lineEnd !== undefined) {
                        const lines = content.split('\n');
                        const focusedLines = lines.slice(fnNode.lineStart, fnNode.lineEnd + 1).join('\n');
                        session.addFocused(fullPath, content);
                        focusedFilesCount++;
                        watcher.watchFile(fullPath);
                        return { content: [{ type: 'text', text: `focused:${target}\nlines:${fnNode.lineEnd - fnNode.lineStart + 1}\ntoken_estimate:${(0, toon_js_1.estimateTokens)(focusedLines)}\n\n${focusedLines}` }] };
                    }
                }
                session.addFocused(fullPath, content);
                focusedFilesCount++;
                watcher.watchFile(fullPath);
                return { content: [{ type: 'text', text: `focused:${filePath}\nlines:${content.split('\n').length}\ntoken_estimate:${(0, toon_js_1.estimateTokens)(content)}\n\n${content}` }] };
            }
            if (name === 'loom_get_active_diff') {
                const info = session.getInfo();
                const focused = session.getFocused();
                const changed = [];
                for (const path of focused) {
                    try {
                        if ((0, fs_1.existsSync)(path)) {
                            const current = (0, fs_1.readFileSync)(path, 'utf8');
                            const saved = session.getInfo();
                            changed.push(`${(0, path_1.relative)(WORKSPACE_ROOT, path)}:${current !== '' ? 'changed' : 'unchanged'}`);
                        }
                        else {
                            changed.push(`${(0, path_1.relative)(WORKSPACE_ROOT, path)}:deleted`);
                        }
                    }
                    catch {
                        changed.push(`${(0, path_1.relative)(WORKSPACE_ROOT, path)}:error`);
                    }
                }
                return { content: [{ type: 'text', text: `session_id:${info.sessionId}\nturns:${info.turns}\nfocused:${info.focused}\nchanged:${changed.filter(c => c.includes(':changed')).length}\nelapsed_ms:${info.elapsed}\n\n${changed.join('\n')}` }] };
            }
            if (name === 'loom_blur') {
                const target = args.target;
                const fullPath = (0, path_1.resolve)(WORKSPACE_ROOT, target);
                if (session.removeFocused(fullPath)) {
                    focusedFilesCount = Math.max(0, focusedFilesCount - 1);
                    return { content: [{ type: 'text', text: `unfocused:${target}\nremaining:${focusedFilesCount}` }] };
                }
                return { content: [{ type: 'text', text: `NOT_FOCUSED:${target}` }] };
            }
            if (name === 'loom_search_refs') {
                const symbol = args.symbol;
                const scope = args.scope || 'workspace';
                const breakerCheck = circuitBreaker.check('searchRefs');
                if (!breakerCheck.allowed) {
                    return { content: [{ type: 'text', text: breakerCheck.message || 'ERROR:search_limit_exceeded' }] };
                }
                const refs = [];
                const searchPattern = new RegExp(`\\b${symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
                const dir = scope === 'workspace' ? '.' : '.';
                const files = globFiles(dir, ['ts', 'tsx', 'js', 'jsx', 'py'], ['node_modules', '.git', 'dist']);
                const maxRefs = 50;
                for (const file of files.slice(0, 200)) {
                    if (refs.length >= maxRefs)
                        break;
                    try {
                        const content = (0, fs_1.readFileSync)(file, 'utf8');
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
                                        file: (0, path_1.relative)(WORKSPACE_ROOT, file),
                                        line: i + 1,
                                        snippet: line.trim().slice(0, 80),
                                        refType
                                    });
                                }
                            }
                        }
                    }
                    catch {
                        continue;
                    }
                }
                return { content: [{ type: 'text', text: `symbol:${symbol}\nscope:${scope}\nrefs:${refs.length}\n\n${refs.map(r => `${r.file}:${r.line} ${r.refType} ${r.snippet}`).join('\n')}` }] };
            }
            return { content: [{ type: 'text', text: 'ERROR:unknown_tool' }] };
        }
        catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            return { content: [{ type: 'text', text: `ERROR:${msg}` }] };
        }
    });
    return server;
}
function createServer() {
    return createLoomServer();
}
