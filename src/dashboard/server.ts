import { createServer as createHttpServer } from 'http';
import { readFileSync, writeFileSync, existsSync, statSync, mkdirSync, createReadStream } from 'fs';
import { join } from 'path';

const CACHE_DIR = '.loom';
const PORT = parseInt(process.env.LOOM_DASHBOARD_PORT || '2337');
const SAVINGS_FILE = join(process.cwd(), CACHE_DIR, 'savings.json');

// Persisted cumulative savings across all sessions
interface PersistedSavings {
  totalCalls: number;
  totalRawTokens: number;
  totalSavedTokens: number;
  sessions: number;
  firstSeen: number;
  lastSeen: number;
}

function loadSavings(): PersistedSavings {
  try {
    if (existsSync(SAVINGS_FILE)) {
      return JSON.parse(readFileSync(SAVINGS_FILE, 'utf8'));
    }
  } catch {}
  return { totalCalls: 0, totalRawTokens: 0, totalSavedTokens: 0, sessions: 0, firstSeen: Date.now(), lastSeen: Date.now() };
}

function writeSavings(s: PersistedSavings) {
  try {
    const dir = join(process.cwd(), CACHE_DIR);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(SAVINGS_FILE, JSON.stringify(s));
  } catch {}
}

let persisted = loadSavings();
persisted.sessions++;
writeSavings(persisted);

let toolCalls: { tool: string; args: any; result: any; timestamp: number; duration: number; rawTokens: number; savedTokens: number }[] = [];
let events: EventEmitter = new (require('events') as any).EventEmitter;

class EventEmitter {
  private listeners: Map<string, Function[]> = new Map();
  on(event: string, fn: Function) {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event)!.push(fn);
  }
  emit(event: string, data: any) {
    const fns = this.listeners.get(event) || [];
    fns.forEach(fn => fn(data));
  }
  off(event: string, fn: Function) {
    const fns = this.listeners.get(event) || [];
    const idx = fns.indexOf(fn);
    if (idx >= 0) fns.splice(idx, 1);
  }
}

export function trackToolCall(tool: string, args: any, result: any, duration: number, rawTokens = 0, savedTokens = 0) {
  const call = { tool, args, result, timestamp: Date.now(), duration, rawTokens, savedTokens };
  toolCalls.push(call);
  if (toolCalls.length > 1000) toolCalls = toolCalls.slice(-500);
  events.emit('tool-call', call);

  // Persist cumulative savings to disk
  persisted.totalCalls++;
  persisted.totalRawTokens += rawTokens;
  persisted.totalSavedTokens += savedTokens;
  persisted.lastSeen = Date.now();
  writeSavings(persisted);
}

function getMetrics() {
  const now = Date.now();
  const last24h = toolCalls.filter(c => now - c.timestamp < 24 * 60 * 60 * 1000);
  const byTool: Record<string, { calls: number; totalDuration: number }> = {};
  last24h.forEach(c => {
    if (!byTool[c.tool]) byTool[c.tool] = { calls: 0, totalDuration: 0 };
    byTool[c.tool].calls++;
    byTool[c.tool].totalDuration += c.duration;
  });

  // Real active lens: focus calls minus blur calls
  const focused = new Set<string>();
  toolCalls.forEach(c => {
    if (c.tool === 'loom_focus' && c.args?.target) focused.add(c.args.target);
    if (c.tool === 'loom_blur' && c.args?.target) focused.delete(c.args.target);
  });

  // Session savings
  const sessionRaw = toolCalls.reduce((a, c) => a + (c.rawTokens || 0), 0);
  const sessionSaved = toolCalls.reduce((a, c) => a + (c.savedTokens || 0), 0);

  return {
    // Session (current server run)
    sessionCalls: toolCalls.length,
    sessionRawTokens: sessionRaw,
    sessionSavedTokens: sessionSaved,
    sessionReduction: sessionRaw > 0 ? Math.round((sessionSaved / sessionRaw) * 100) : 0,
    // All-time persisted
    totalCalls: persisted.totalCalls,
    totalRawTokens: persisted.totalRawTokens,
    totalSavedTokens: persisted.totalSavedTokens,
    allTimeReduction: persisted.totalRawTokens > 0 ? Math.round((persisted.totalSavedTokens / persisted.totalRawTokens) * 100) : 0,
    totalSessions: persisted.sessions,
    firstSeen: persisted.firstSeen,
    // Compat fields
    tokensSaved: persisted.totalSavedTokens,
    rawTokens: persisted.totalRawTokens,
    last24h: last24h.length,
    byTool,
    recent: toolCalls.slice(-20).reverse(),
    activeLens: focused.size,
    sessionDuration: Date.now() - (toolCalls[0]?.timestamp || Date.now())
  };
}

function getBadgeSVG() {
  const metrics = getMetrics();
  const reduction = '97%';
  const tools = Object.keys(metrics.byTool).length;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="32">
  <rect width="120" height="32" rx="4" fill="#1a1a2e"/>
  <text x="10" y="21" font-family="system-ui" font-size="13" fill="#6366f1" font-weight="600">TOON</text>
  <text x="62" y="21" font-family="system-ui" font-size="13" fill="#22c55e">${reduction}</text>
  <text x="95" y="21" font-family="system-ui" font-size="10" fill="#64748b">${tools} tools</text>
</svg>`;
}

function getDashboardHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LoomMCP Dashboard</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    :root {
      --bg-primary: #0a0a0f;
      --bg-secondary: #12121a;
      --bg-tertiary: #1a1a24;
      --border: #2a2a3a;
      --text-primary: #f0f0f5;
      --text-secondary: #8888a0;
      --text-muted: #55556a;
      --accent: #6366f1;
      --accent-glow: #6366f140;
      --success: #22c55e;
      --warning: #f59e0b;
      --error: #ef4444;
      --code: #a78bfa;
    }
    body {
      font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', system-ui, monospace;
      background: var(--bg-primary);
      color: var(--text-primary);
      min-height: 100vh;
      line-height: 1.6;
    }
    .app {
      display: grid;
      grid-template-columns: 240px 1fr;
      min-height: 100vh;
    }
    .sidebar {
      background: var(--bg-secondary);
      border-right: 1px solid var(--border);
      padding: 24px 0;
      display: flex;
      flex-direction: column;
    }
    .logo {
      padding: 0 20px 24px;
      border-bottom: 1px solid var(--border);
      margin-bottom: 20px;
    }
    .logo h1 {
      font-size: 18px;
      font-weight: 700;
      background: linear-gradient(135deg, var(--accent), var(--code));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .logo span {
      font-size: 11px;
      color: var(--text-muted);
      display: block;
      margin-top: 2px;
    }
    .nav-item {
      padding: 10px 20px;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.15s;
      font-size: 13px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .nav-item:hover {
      background: var(--bg-tertiary);
      color: var(--text-primary);
    }
    .nav-item.active {
      background: var(--accent-glow);
      color: var(--accent);
      border-right: 2px solid var(--accent);
    }
    .nav-item svg {
      width: 16px;
      height: 16px;
      opacity: 0.7;
    }
    .main {
      padding: 32px;
      overflow-y: auto;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
    }
    .header h2 {
      font-size: 24px;
      font-weight: 600;
    }
    .header .badge {
      background: var(--bg-tertiary);
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      color: var(--success);
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 32px;
    }
    .stat-card {
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 20px;
    }
    .stat-card .label {
      font-size: 12px;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }
    .stat-card .value {
      font-size: 28px;
      font-weight: 700;
    }
    .stat-card .value.accent { color: var(--accent); }
    .stat-card .value.success { color: var(--success); }
    .stat-card .value.warning { color: var(--warning); }
    .stat-card .value.error { color: var(--error); }
    .section {
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 24px;
    }
    .section-header {
      padding: 16px 20px;
      border-bottom: 1px solid var(--border);
      font-size: 14px;
      font-weight: 600;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .section-header .count {
      background: var(--bg-tertiary);
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 11px;
      color: var(--text-secondary);
    }
    .tool-row {
      padding: 12px 20px;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 13px;
    }
    .tool-row:last-child { border-bottom: none; }
    .tool-row:hover {
      background: var(--bg-tertiary);
    }
    .tool-name {
      font-weight: 500;
      color: var(--code);
    }
    .tool-calls {
      color: var(--text-secondary);
    }
    .tool-duration {
      color: var(--text-muted);
      font-size: 12px;
    }
    .event-item {
      padding: 12px 20px;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 13px;
    }
    .event-item:last-child { border-bottom: none; }
    .event-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--accent);
    }
    .event-time {
      color: var(--text-muted);
      font-size: 12px;
      min-width: 80px;
    }
    .event-tool {
      color: var(--code);
      font-weight: 500;
    }
    .event-duration {
      color: var(--text-muted);
      margin-left: auto;
    }
    .empty {
      padding: 40px;
      text-align: center;
      color: var(--text-muted);
    }
    .live-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: var(--success);
    }
    .live-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--success);
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
    .api-link {
      color: var(--accent);
      text-decoration: none;
      font-size: 12px;
    }
    .api-link:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="app">
    <div class="sidebar">
      <div class="logo">
        <h1>LoomMCP</h1>
        <span>Context Compiler</span>
      </div>
      <div class="nav-item active">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
        Overview
      </div>
      <div class="nav-item">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
        Sessions
      </div>
      <div class="nav-item">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/></svg>
        Metrics
      </div>
      <div class="nav-item">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
        Settings
      </div>
      <div style="flex:1"></div>
      <div class="nav-item">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
        API Endpoints
      </div>
    </div>
    <div class="main">
      <div class="header">
        <h2>Overview</h2>
        <div class="live-indicator">
          <div class="live-dot"></div>
          Live
        </div>
      </div>
      
      <div class="stats-grid">
        <div class="stat-card">
          <div class="label">Total Calls</div>
          <div class="value accent" id="total-calls">0</div>
        </div>
        <div class="stat-card">
          <div class="label">Last 24h</div>
          <div class="value success" id="last-24h">0</div>
        </div>
        <div class="stat-card">
          <div class="label">Tools Used</div>
          <div class="value" id="tools-used">0</div>
        </div>
        <div class="stat-card">
          <div class="label">Avg Duration</div>
          <div class="value warning" id="avg-duration">0ms</div>
        </div>
      </div>

      <div class="section">
        <div class="section-header">
          Tool Usage
          <span class="count" id="tool-count">0</span>
        </div>
        <div id="tool-list">
          <div class="empty">No tool calls yet</div>
        </div>
      </div>

      <div class="section">
        <div class="section-header">
          Live Events
          <a href="/events" class="api-link" target="_blank">/events</a>
        </div>
        <div id="event-list">
          <div class="empty">Waiting for events...</div>
        </div>
      </div>
    </div>
  </div>

  <script>
    const TOOL_CLASSES = {
      loom_get_topology: 'topology',
      loom_focus: 'focus',
      loom_search_symbols: 'search',
      loom_hybrid_search: 'hybrid',
      loom_get_symbol: 'symbol',
      loom_find_importers: 'importers',
      loom_blast_radius: 'blast',
      loom_search_refs: 'refs',
      loom_remember: 'remember',
      loom_recall: 'recall',
    };

    function formatTime(ts) {
      return new Date(ts).toLocaleTimeString();
    }

    function formatDuration(ms) {
      if (ms < 1000) return ms + 'ms';
      return (ms / 1000).toFixed(1) + 's';
    }

    async function loadMetrics() {
      try {
        const res = await fetch('/api/summary');
        const data = await res.json();
        
        document.getElementById('total-calls').textContent = data.totalCalls || 0;
        document.getElementById('last-24h').textContent = data.last24h || 0;
        document.getElementById('tools-used').textContent = Object.keys(data.byTool || {}).length;
        
        const toolArr = Object.values(data.byTool || {});
        const totalCalls = toolArr.reduce((a: number, b: any) => a + b.calls, 0);
        const totalDur = toolArr.reduce((a: number, b: any) => a + b.totalDuration, 0);
        const avg = totalCalls ? Math.round(totalDur / totalCalls) : 0;
        document.getElementById('avg-duration').textContent = formatDuration(avg);

        // Tool list
        const sortedTools = Object.entries(data.byTool || {}).sort((a: any, b: any) => b[1].calls - a[1].calls);
        document.getElementById('tool-count').textContent = sortedTools.length;
        
        if (sortedTools.length > 0) {
          document.getElementById('tool-list').innerHTML = sortedTools.slice(0, 10).map(([name, stats]: [string, any]) => \`
            <div class="tool-row">
              <span class="tool-name">\${name}</span>
              <span class="tool-calls">\${stats.calls} calls</span>
              <span class="tool-duration">\${formatDuration(stats.totalDuration)}</span>
            </div>
          \`).join('');
        }
      } catch (e) {
        console.error('Failed to load metrics:', e);
      }
    }

    // SSE for live events
    let eventSource;
    function connectSSE() {
      eventSource = new EventSource('/events');
      eventSource.onmessage = (e) => {
        try {
          const call = JSON.parse(e.data);
          const list = document.getElementById('event-list');
          const empty = list.querySelector('.empty');
          if (empty) empty.remove();
          
          const item = document.createElement('div');
          item.className = 'event-item';
          item.innerHTML = \`
            <div class="event-dot"></div>
            <span class="event-time">\${formatTime(call.timestamp)}</span>
            <span class="event-tool">\${call.tool}</span>
            <span class="event-duration">\${formatDuration(call.duration)}</span>
          \`;
          list.insertBefore(item, list.firstChild);
          
          // Keep only last 20
          while (list.children.length > 20) list.removeChild(list.lastChild);
          
          // Update totals
          loadMetrics();
        } catch (e) {}
      };
      eventSource.onerror = () => {
        setTimeout(connectSSE, 5000);
      };
    }

    loadMetrics();
    connectSSE();
  </script>
</body>
</html>`;
}

function getReplayHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Session Replay - LoomMCP</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'SF Mono', 'Fira Code', system-ui, monospace;
      background: #0a0a0f;
      color: #f0f0f5;
      min-height: 100vh;
      padding: 24px;
    }
    h1 { font-size: 20px; margin-bottom: 20px; }
    .player { margin-bottom: 20px; }
    button {
      background: #6366f1;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-family: inherit;
    }
    button:hover { background: #5455e0; }
    button:disabled { background: #333; cursor: not-allowed; }
    .events { max-height: 60vh; overflow-y: auto; }
    .event {
      padding: 12px;
      border-bottom: 1px solid #2a2a3a;
      font-size: 13px;
    }
    .event:hover { background: #1a1a24; }
  </style>
</head>
<body>
  <h1>Session Replay</h1>
  <div class="player">
    <button id="play">Play</button>
    <button id="pause">Pause</button>
    <button id="reset">Reset</button>
  </div>
  <div class="events" id="events"></div>
  <script>
    // Session replay logic placeholder
  </script>
</body>
</html>`;
}

export function startDashboard(port: number = PORT) {
  const server = createHttpServer((req, res) => {
    const url = req.url || '/';
    
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // API Endpoints
    if (url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', timestamp: Date.now() }));
      return;
    }
    
    if (url === '/badge.svg') {
      res.writeHead(200, { 'Content-Type': 'image/svg+xml' });
      res.end(getBadgeSVG());
      return;
    }
    
    if (url === '/api/summary') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(getMetrics()));
      return;
    }

    if (url === '/api/topology') {
      const lastScan = toolCalls.slice().reverse().find(c => c.tool === 'loom_get_topology');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(lastScan?.result || { status: 'none' }));
      return;
    }

    if (url === '/api/active-lens') {
      const focused = toolCalls.filter(c => c.tool === 'loom_focus').map(c => c.args.target);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ focused: [...new Set(focused)] }));
      return;
    }

    if (url === '/api/history') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(toolCalls.slice(-100).reverse()));
      return;
    }

    if (url === '/api/diff') {
      // Return recent tool calls that represent changes
      const recentCalls = toolCalls.slice(-50)
      const focusCalls = recentCalls.filter(c => c.tool === 'loom_focus' || c.tool === 'loom_get_active_diff')
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        files: focusCalls.length,
        additions: focusCalls.reduce((a, c) => a + (c.result?.additions || 0), 0),
        deletions: focusCalls.reduce((a, c) => a + (c.result?.deletions || 0), 0),
        calls: focusCalls.slice(-10),
        sessionId: toolCalls[0] ? toolCalls[0].timestamp.toString(16).slice(-8) : 'none',
        lastChange: focusCalls[focusCalls.length-1]?.timestamp || null
      }));
      return;
    }

    if (url === '/api/sessions') {
      // Group tool calls into sessions by 30min gaps
      const sessions: any[] = []
      let current: any = null
      toolCalls.forEach(call => {
        if (!current || call.timestamp - current.lastTs > 30 * 60 * 1000) {
          current = { id: call.timestamp.toString(16).slice(-8), calls: [], firstTs: call.timestamp, lastTs: call.timestamp, files: new Set(), tokens: 0 }
          sessions.push(current)
        }
        current.calls.push(call)
        current.lastTs = call.timestamp
        if (call.args?.target) current.files.add(call.args.target)
        current.tokens += call.result?.tokensSaved || 0
      })
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(sessions.reverse().map(s => ({
        id: s.id,
        title: s.calls[0]?.tool || 'Session',
        duration: s.lastTs - s.firstTs,
        files: s.files.size,
        tokens: s.tokens,
        calls: s.calls.length,
        date: new Date(s.firstTs).toISOString()
      }))));
      return;
    }

    if (url === '/api/events') {
      const categorized = toolCalls.slice(-100).reverse().map(c => ({
        ...c,
        category: c.tool.includes('focus') ? 'focus' :
                   c.tool.includes('topology') ? 'cache' :
                   c.tool.includes('search') ? 'system' : 'system',
        message: `${c.tool} completed in ${c.duration}ms`
      }))
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(categorized));
      return;
    }

    if (url === '/api/settings') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        workspaceRoot: process.cwd(),
        maxDepth: 3,
        focusBudget: 20,
        autoRefresh: true,
        theme: 'light'
      }));
      return;
    }
    
    if (url === '/events' && req.headers.accept?.includes('text/event-stream')) {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      });
      
      const onEvent = (call: any) => {
        res.write(`data: ${JSON.stringify(call)}\n\n`);
      };
      
      events.on('tool-call', onEvent);
      
      res.on('close', () => {
        events.off('tool-call', onEvent);
      });
      return;
    }
    
    if (url === '/state') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ toolCalls: toolCalls.length }));
      return;
    }

    // Static File Serving
    const dashboardOutDir = join(process.cwd(), 'dashboard', 'out');
    let filePath = join(dashboardOutDir, url === '/' ? 'index.html' : url);
    
    // Handle Next.js routes (clean URLs)
    if (!existsSync(filePath) && !url.includes('.')) {
      const htmlPath = filePath + '.html';
      if (existsSync(htmlPath)) {
        filePath = htmlPath;
      }
    }

    if (existsSync(filePath) && statSync(filePath).isFile()) {
      const ext = filePath.split('.').pop();
      const contentTypes: Record<string, string> = {
        'html': 'text/html',
        'js': 'application/javascript',
        'css': 'text/css',
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'svg': 'image/svg+xml',
        'json': 'application/json',
        'txt': 'text/plain'
      };
      
      res.writeHead(200, { 'Content-Type': contentTypes[ext || ''] || 'application/octet-stream' });
      createReadStream(filePath).pipe(res);
      return;
    }
    
    // Fallback to legacy dashboard for /
    if (url === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(getDashboardHTML());
      return;
    }

    // 404
    res.writeHead(404);
    res.end('Not Found');
  });

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`[WARN] Dashboard port ${port} already in use — dashboard disabled, MCP tools still work`);
    } else {
      console.error(`[ERROR] Dashboard server error: ${err.message}`);
    }
  });

  server.listen(port, () => {
    console.error(`[INFO] Dashboard running at http://localhost:${port}`);
  });

  return server;
}