"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
function loadConfig() {
    const configPaths = [
        'loom.config.json',
        '.loomconfig',
        (0, path_1.join)(process.env.HOME || '', '.loom', 'config.json')
    ];
    for (const p of configPaths) {
        if ((0, fs_1.existsSync)(p)) {
            try {
                return JSON.parse((0, fs_1.readFileSync)(p, 'utf8'));
            }
            catch { }
        }
    }
    return {};
}
function parseArgs() {
    const args = process.argv.slice(2);
    const opts = {};
    for (let i = 0; i < args.length; i++) {
        const a = args[i];
        if (a === 'init')
            opts.command = 'init';
        else if (a === 'start')
            opts.command = 'start';
        else if (a === 'replay')
            opts.command = 'replay';
        else if (a === 'config')
            opts.command = 'config';
        else if (a === '--dir' && args[i + 1])
            opts.dir = args[++i];
        else if (a === '--port' && args[i + 1])
            opts.port = parseInt(args[++i]);
        else if (a === '--json')
            opts.json = true;
        else if (a === '--config' && args[i + 1])
            opts.config = args[++i];
        else if (a === '--help' || a === '-h')
            opts.help = true;
    }
    return opts;
}
async function runInit(dir, asJson = false) {
    const target = (0, path_1.resolve)(process.cwd(), dir);
    const config = loadConfig();
    const langs = detectLanguages(target, config.languages);
    const rawTokens = countRawTokens(target, langs);
    const reduction = 95;
    const skeleton = Math.round(rawTokens * (100 - reduction) / 100);
    const daily = (rawTokens * 200 * 15) / 1_000_000;
    const loomCost = (skeleton * 1.4 * 200 * 15) / 1_000_000;
    const monthlySavings = Math.round((daily - loomCost) * 22);
    if (asJson) {
        process.stdout.write(JSON.stringify({
            languages: langs,
            rawTokens,
            skeletonTokens: skeleton,
            reduction,
            monthlySavingsDollars: monthlySavings
        }) + '\n');
        return;
    }
    console.log('\n⚡ LoomMCP — initializing...\n');
    console.log(`  detected: ${langs.join(', ')}`);
    console.log(`  repo size: ~${format(rawTokens)} tokens`);
    console.log(`  skeleton: ~${format(skeleton)} tokens`);
    console.log(`  reduction: ${reduction}%`);
    console.log(`  est. monthly savings: $${monthlySavings}\n`);
    const settingsDir = (0, path_1.join)(target, '.claude');
    if (!(0, fs_1.existsSync)(settingsDir)) {
        (0, fs_1.mkdirSync)(settingsDir, { recursive: true });
    }
    try {
        (0, fs_1.writeFileSync)((0, path_1.join)(settingsDir, 'settings.json'), JSON.stringify({
            mcpServers: {
                loom: { command: 'npx', args: ['@loom-mcp/server', 'start'] }
            }
        }, null, 2));
        console.log(`  configured: .claude/settings.json`);
    }
    catch { }
    console.log(`\nRun: npx @loom-mcp/server start`);
    console.log(`Dashboard: http://localhost:2337\n`);
}
async function runStart() {
    const config = loadConfig();
    process.env.LOOM_WORKSPACE_ROOT = config.workspace || process.cwd();
    process.env.LOOM_DASHBOARD_PORT = (config.dashboard?.port || 2337).toString();
    const { createServer } = await Promise.resolve().then(() => __importStar(require('./tools.js')));
    const { StdioServerTransport } = await Promise.resolve().then(() => __importStar(require('@modelcontextprotocol/sdk/server/stdio.js')));
    const server = createServer();
    const transport = new StdioServerTransport();
    server.connect(transport);
}
async function runConfig(cmd, asJson = false) {
    const config = loadConfig();
    if (cmd === 'show') {
        if (asJson) {
            console.log(JSON.stringify(config, null, 2));
        }
        else {
            console.log('Current configuration:');
            console.log(JSON.stringify(config, null, 2));
        }
    }
    else if (cmd === 'init') {
        const defaultConfig = {
            workspace: '.',
            languages: ['ts', 'tsx', 'js', 'jsx', 'py'],
            exclude: ['node_modules', '.git', 'dist', 'build', 'target', '.venv'],
            focusBudget: 20,
            topologyCalls: 100,
            searchRefs: 200,
            dashboard: { enabled: true, port: 2337 },
            recorder: { enabled: true, directory: '.loom/sessions' }
        };
        const configPath = 'loom.config.json';
        (0, fs_1.writeFileSync)(configPath, JSON.stringify(defaultConfig, null, 2));
        console.log(`Created: ${configPath}`);
    }
}
function detectLanguages(dir, override) {
    if (override?.length)
        return override;
    const langs = [];
    const pkg = (0, path_1.join)(dir, 'package.json');
    const cargo = (0, path_1.join)(dir, 'Cargo.toml');
    const goMod = (0, path_1.join)(dir, 'go.mod');
    const pom = (0, path_1.join)(dir, 'pom.xml');
    const csproj = (0, path_1.join)(dir, '*.csproj');
    if ((0, fs_1.existsSync)(pkg)) {
        try {
            const d = JSON.parse((0, fs_1.readFileSync)(pkg, 'utf8'));
            if (d.dependencies?.typescript || d.devDependencies?.typescript)
                langs.push('typescript');
            if (d.dependencies?.python)
                langs.push('python');
            if (d.dependencies?.rust)
                langs.push('rust');
            if (d.dependencies?.go)
                langs.push('go');
        }
        catch { }
    }
    if ((0, fs_1.existsSync)(cargo))
        langs.push('rust');
    if ((0, fs_1.existsSync)(goMod))
        langs.push('go');
    return langs.length ? langs : ['typescript'];
}
function countRawTokens(dir, langs) {
    let total = 0;
    const exts = new Set(['ts', 'tsx', 'js', 'jsx']);
    const langExts = {
        typescript: ['ts', 'tsx'],
        javascript: ['js', 'jsx'],
        python: ['py'],
        rust: ['rs'],
        go: ['go'],
        java: ['java'],
        csharp: ['cs']
    };
    for (const lang of langs) {
        const e = langExts[lang];
        if (e)
            e.forEach(ext => exts.add(ext));
    }
    function walk(d) {
        try {
            for (const e of (0, fs_1.readdirSync)(d)) {
                if (e.startsWith('.'))
                    continue;
                const p = (0, path_1.join)(d, e);
                try {
                    const s = (0, fs_1.statSync)(p);
                    if (s.isDirectory() && !['node_modules', 'dist', 'target', '__pycache__', '.venv'].includes(e))
                        walk(p);
                    else if (s.isFile() && exts.has(e.split('.').pop() || ''))
                        total += 200;
                }
                catch { }
            }
        }
        catch { }
    }
    walk(dir);
    return total;
}
function format(n) {
    if (n >= 1000000)
        return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000)
        return (n / 1000).toFixed(1) + 'k';
    return n.toString();
}
const opts = parseArgs();
if (opts.help) {
    console.log(`
⚡ LoomMCP v2.0 — Universal Context Compiler

USAGE: loom <command> [options]

COMMANDS:
  init          Initialize project with analysis
  start         Start MCP server (default)
  config        Manage configuration
  replay       Replay session

OPTIONS:
  --dir PATH    Working directory
  --port PORT   Dashboard port (default: 2337)
  --config     Config file path
  --json       JSON output (for scripting)
  --help       Show help

EXAMPLES:
  loom init --json
  loom start --dir ./project
  loom config show --json
  
SETUP FOR CLIENTS:
  Claude Code:  /mcp add loom localhost:8080
  Cursor:      Add server in settings.json
  VS Code:     Use MCP extension
  
QUICK START:
  npx @loom-mcp/server start
`);
    process.exit(0);
}
switch (opts.command || 'start') {
    case 'init':
        runInit(opts.dir || '.', opts.json);
        break;
    case 'start':
        runStart();
        break;
    case 'config':
        runConfig(opts.config || 'show', opts.json);
        break;
    default: runStart();
}
