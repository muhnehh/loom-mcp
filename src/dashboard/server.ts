import express, { Request, Response } from 'express';
import { createServer as createHttpServer } from 'http';
import { readFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';

interface SessionState {
  tokens_used: number;
  tokens_saved: number;
  turns: number;
  focused_files: string[];
  start_time: number;
}

let sessionState: SessionState = {
  tokens_used: 0,
  tokens_saved: 0,
  turns: 0,
  focused_files: [],
  start_time: Date.now()
};

const clients: Set<Response> = new Set();

function emitEvent(data: any) {
  const payload = JSON.stringify({ ...sessionState, ...data });
  clients.forEach(client => {
    client.write(`data: ${payload}\n\n`);
  });
}

export function startDashboard(port: number = 2337) {
  const app = express();
  
  app.use(express.json());

  app.get('/', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(getDashboardHTML());
  });

  app.get('/events', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    clients.add(res);
    
    res.write(`data: ${JSON.stringify(sessionState)}\n\n`);
    
    req.on('close', () => {
      clients.delete(res);
    });
  });

  app.post('/emit', (req: Request, res: Response) => {
    const { tool, target, tokens_in, tokens_saved, latency_ms, focused } = req.body;
    
    sessionState.tokens_used += tokens_in || 0;
    sessionState.tokens_saved += tokens_saved || 0;
    sessionState.turns++;
    
    if (focused && Array.isArray(focused)) {
      sessionState.focused_files = focused;
    }

    emitEvent({ last_call: { tool, target, tokens_in, tokens_saved, latency_ms } });
    res.json({ ok: true });
  });

  app.get('/state', (req: Request, res: Response) => {
    res.json(sessionState);
  });

  const server = createHttpServer(app);
  server.listen(port, () => {
    console.log(`Dashboard: http://localhost:${port}`);
  });

  return { app, server };
}

export function trackToolCall(tool: string, target: string, tokens_in: number, tokens_saved: number, latency_ms: number) {
  emitEvent({ 
    tool, 
    target, 
    tokens_in, 
    tokens_saved, 
    latency_ms,
    timestamp: Date.now()
  });
}

function getDashboardHTML(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>LoomMCP Dashboard</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    :root { --bg: #0D1117; --surface: #161B22; --border: #30363D; --green: #3FB950; --text: #E6EDF3; --muted: #8B949E; }
    body { background: var(--bg); color: var(--text); font-family: -apple-system, sans-serif; min-height: 100vh; display: flex; flex-direction: column; }
    header { background: var(--surface); border-bottom: 1px solid var(--border); padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; }
    header h1 { font-size: 1.25rem; }
    header h1 span { color: var(--green); }
    main { flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; padding: 1rem; }
    .panel { background: var(--surface); border: 1px solid var(--border); border-radius: 0.5rem; padding: 1.5rem; }
    .panel-label { font-size: 0.75rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem; }
    .big-number { font-family: 'JetBrains Mono', monospace; font-size: 3rem; font-weight: 700; color: var(--green); line-height: 1; }
    .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
    .stat { text-align: center; padding: 1rem; background: var(--surface); border-top: 1px solid var(--border); }
    .stat-value { font-family: monospace; font-size: 1.25rem; }
    .stat-label { font-size: 0.625rem; color: var(--muted); text-transform: uppercase; }
  </style>
</head>
<body>
  <header>
    <h1><span>⚡</span> LoomMCP <span>Dashboard</span></h1>
  </header>
  <main>
    <div class="panel">
      <div class="panel-label">Tokens Saved</div>
      <div class="big-number" id="tokens">0</div>
    </div>
    <div class="panel">
      <div class="panel-label">Session Stats</div>
      <div id="stats">Waiting for tool calls...</div>
    </div>
  </main>
  <div class="stat-grid">
    <div class="stat"><div class="stat-value" id="turns">0</div><div class="stat-label">Turns</div></div>
    <div class="stat"><div class="stat-value" id="latency">--</div><div class="stat-label">Latency</div></div>
    <div class="stat"><div class="stat-value" id="cache">--</div><div class="stat-label">Cache</div></div>
    <div class="stat"><div class="stat-value" id="duration">0s</div><div class="stat-label">Duration</div></div>
  </div>
  <script>
    const evt = new EventSource('/events');
    evt.onmessage = (e) => {
      const d = JSON.parse(e.data);
      if (d.tokens_saved) document.getElementById('tokens').textContent = d.tokens_saved.toLocaleString();
      if (d.turns) document.getElementById('turns').textContent = d.turns;
      if (d.last_call?.latency_ms) document.getElementById('latency').textContent = d.last_call.latency_ms + 'ms';
    };
  </script>
</body>
</html>`;
}