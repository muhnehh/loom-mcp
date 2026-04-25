import { readdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { generateReportHTML } from '../report/generator.js';

const SESSION_DIR = '.loom/sessions';
const OUTPUT_DIR = '.loom/reports';

export function listSessions() {
  if (!existsSync(SESSION_DIR)) return [];
  return readdirSync(SESSION_DIR)
    .filter(f => f.endsWith('.jsonl'))
    .sort()
    .reverse()
    .map(f => {
      const path = join(SESSION_DIR, f);
      const content = readFileSync(path, 'utf8');
      const lines = content.trim().split('\n').length;
      const bytes = content.length;
      return { filename: f, path, calls: lines, bytes };
    });
}

export function loadSession(filename: string) {
  const path = join(SESSION_DIR, filename);
  if (!existsSync(path)) return null;
  const content = readFileSync(path, 'utf8');
  const records = content.trim().split('\n').map(l => {
    try { return JSON.parse(l); } catch { return null; }
  }).filter(Boolean);

  const tokens_used = records.reduce((s, r) => s + (r.tokens_in || 0), 0);
  const tokens_saved = records.reduce((s, r) => s + (r.tokens_saved || 0), 0);
  const turns = records.length;
  const reduction = tokens_used > 0 ? Math.round((tokens_saved / tokens_used) * 100) : 0;
  const cost_saved = (tokens_saved / 1_000_000) * 15;

  return {
    records,
    totals: { tokens_used, tokens_saved, reduction, cost_saved, turns }
  };
}

export function generateReplayHTML(records: any[]): string {
  const totalTokens = records.reduce((s, r) => s + (r.tokens_in || 0), 0);
  const totalSaved = records.reduce((s, r) => s + (r.tokens_saved || 0), 0);
  const reduction = totalTokens > 0 ? Math.round((totalSaved / totalTokens) * 100) : 0;
  const totalTime = records.length > 1 ? records[records.length - 1].ts - records[0].ts : 0;
  const totalMs = totalTokens > 0 ? records.reduce((s, r) => s + (r.latency_ms || 0), 0) : 0;

  const rows = records.map((r, i) => {
    const ts = new Date(r.ts).toLocaleTimeString();
    const toolColor = getToolColor(r.tool);
    return `
    <div class="event" id="event-${i}" data-index="${i}">
      <div class="event-line">
        <div class="event-dot" style="border-color:${toolColor};box-shadow:0 0 8px ${toolColor}40"></div>
        <div class="event-time">${ts}</div>
        <div class="event-tool" style="color:${toolColor}">${r.tool}</div>
        <div class="event-target">${escapeHtml(r.target || '')}</div>
        <div class="event-stats">
          <span class="tokens-in">${(r.tokens_in || 0).toLocaleString()} in</span>
          <span class="tokens-saved">${(r.tokens_saved || 0).toLocaleString()} saved</span>
          <span class="latency">${r.latency_ms || 0}ms</span>
        </div>
      </div>
      <div class="event-bar" style="background:${toolColor};width:${Math.max(2, (r.tokens_saved || 0) / (totalSaved || 1) * 100)}%"></div>
    </div>`;
  }).join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>LoomMCP Session Replay</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    :root { --bg: #0D1117; --surface: #161B22; --border: #30363D; --green: #3FB950; --text: #E6EDF3; --muted: #8B949E; --amber: #D29922; --red: #F85149; --blue: #58A6FF; --purple: #A371F7; }
    body { background: var(--bg); color: var(--text); font-family: -apple-system, sans-serif; min-height: 100vh; }
    header { background: var(--surface); border-bottom: 1px solid var(--border); padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; }
    h1 { font-size: 1.25rem; }
    h1 span { color: var(--green); }
    .controls { display: flex; gap: 0.5rem; align-items: center; }
    button { background: var(--surface); border: 1px solid var(--border); color: var(--text); padding: 0.5rem 1rem; border-radius: 0.375rem; cursor: pointer; font-size: 0.875rem; }
    button:hover { border-color: var(--green); }
    button.active { background: var(--green); color: var(--bg); border-color: var(--green); }
    .hero { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; padding: 1.5rem 2rem; }
    .stat { background: var(--surface); border: 1px solid var(--border); border-radius: 0.5rem; padding: 1.5rem; text-align: center; }
    .stat-value { font-family: 'JetBrains Mono', monospace; font-size: 2.5rem; font-weight: 700; color: var(--green); }
    .stat-label { font-size: 0.75rem; color: var(--muted); text-transform: uppercase; margin-top: 0.5rem; }
    .timeline { padding: 0 2rem 2rem; }
    .event { position: relative; padding: 0.75rem 0 0.75rem 1.5rem; border-left: 2px solid var(--border); margin-left: 0.5rem; }
    .event.active { border-left-color: var(--green); }
    .event.active .event-dot { background: var(--green); }
    .event-dot { width: 12px; height: 12px; border-radius: 50%; border: 2px solid; background: var(--bg); position: absolute; left: -7px; top: 1rem; transition: all 0.3s; }
    .event-time { font-size: 0.75rem; color: var(--muted); }
    .event-tool { font-weight: 600; font-size: 0.875rem; }
    .event-target { font-size: 0.75rem; color: var(--muted); margin-top: 0.25rem; }
    .event-stats { display: flex; gap: 0.75rem; margin-top: 0.25rem; font-size: 0.75rem; font-family: monospace; }
    .tokens-in { color: var(--blue); }
    .tokens-saved { color: var(--green); }
    .latency { color: var(--muted); }
    .event-bar { height: 3px; border-radius: 2px; margin-top: 0.25rem; opacity: 0.6; }
    .bar-chart { display: flex; align-items: flex-end; gap: 2px; height: 60px; padding: 0.5rem 2rem; border-bottom: 1px solid var(--border); }
    .bar { flex: 1; border-radius: 2px 2px 0 0; min-width: 2px; cursor: pointer; transition: opacity 0.2s; }
    .bar:hover { opacity: 0.8; }
  </style>
</head>
<body>
  <header>
    <h1><span>&#9889;</span> LoomMCP <span>Session Replay</span></h1>
    <div class="controls">
      <button id="playBtn" onclick="play()">Play</button>
      <button id="pauseBtn" onclick="pause()" style="display:none">Pause</button>
      <button onclick="reset()">Reset</button>
      <button onclick="window.print()">Screenshot</button>
    </div>
  </header>
  <div class="hero">
    <div class="stat"><div class="stat-value">${records.length}</div><div class="stat-label">Tool Calls</div></div>
    <div class="stat"><div class="stat-value">${totalSaved.toLocaleString()}</div><div class="stat-label">Tokens Saved</div></div>
    <div class="stat"><div class="stat-value">${reduction}%</div><div class="stat-label">Reduction</div></div>
    <div class="stat"><div class="stat-value">${Math.round(totalMs)}ms</div><div class="stat-label">Total Time</div></div>
  </div>
  <div class="bar-chart" id="barChart"></div>
  <div class="timeline" id="timeline">${rows}</div>
  <script>
    const records = ${JSON.stringify(records)};
    let current = -1;
    let timer = null;
    let speed = 800;

    const colors = { loom_get_topology: '#58A6FF', loom_focus: '#3FB950', loom_search_refs: '#A371F7', loom_get_active_diff: '#D29922', loom_blur: '#F85149' };
    function getColor(tool) { return colors[tool] || '#8B949E'; }

    const bars = document.getElementById('barChart');
    const maxSaved = Math.max(...records.map(r => r.tokens_saved || 0), 1);
    records.forEach((r, i) => {
      const bar = document.createElement('div');
      bar.className = 'bar';
      bar.style.height = ((r.tokens_saved || 0) / maxSaved * 100) + '%';
      bar.style.background = getColor(r.tool);
      bar.title = r.tool + ' — ' + (r.tokens_saved || 0) + ' saved';
      bar.onclick = () => jumpTo(i);
      bars.appendChild(bar);
    });

    function activate(idx) {
      document.querySelectorAll('.event').forEach((e, i) => {
        e.classList.toggle('active', i === idx);
      });
      const el = document.getElementById('event-' + idx);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      current = idx;
    }

    function jumpTo(idx) {
      pause();
      activate(idx);
    }

    function play() {
      document.getElementById('playBtn').style.display = 'none';
      document.getElementById('pauseBtn').style.display = 'inline';
      if (current >= records.length - 1) current = -1;
      timer = setInterval(() => {
        current++;
        if (current >= records.length) { pause(); return; }
        activate(current);
      }, speed);
    }

    function pause() {
      clearInterval(timer);
      timer = null;
      document.getElementById('playBtn').style.display = 'inline';
      document.getElementById('pauseBtn').style.display = 'none';
    }

    function reset() {
      pause();
      activate(-1);
      document.querySelectorAll('.event').forEach(e => e.classList.remove('active'));
      current = -1;
    }
  </script>
</body>
</html>`;
}

function getToolColor(tool: string): string {
  const colors: Record<string, string> = {
    loom_get_topology: '#58A6FF',
    loom_focus: '#3FB950',
    loom_search_refs: '#A371F7',
    loom_get_active_diff: '#D29922',
    loom_blur: '#F85149'
  };
  return colors[tool] || '#8B949E';
}

function escapeHtml(s: string): string {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}