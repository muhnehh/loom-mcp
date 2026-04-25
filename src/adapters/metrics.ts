import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'fs';
import { join } from 'path';

export interface ToolMetrics {
  tool: string;
  count: number;
  totalLatencyMs: number;
  avgLatencyMs: number;
  totalTokensIn: number;
  totalTokensSaved: number;
  lastUsed: number;
}

export interface SessionMetrics {
  sessionId: string;
  startTime: number;
  endTime?: number;
  totalTurns: number;
  totalTokensUsed: number;
  totalTokensSaved: number;
  reductionPct: number;
  tools: Map<string, ToolMetrics>;
  errors: number;
}

export class MetricsCollector {
  private metricsDir: string;
  private currentSession: SessionMetrics;
  private sessionFile: string;

  constructor(metricsDir: string = '.loom/metrics') {
    this.metricsDir = metricsDir;
    this.sessionFile = join(metricsDir, 'current.json');

    if (!existsSync(metricsDir)) {
      mkdirSync(metricsDir, { recursive: true });
    }

    this.currentSession = this.loadOrCreate();
  }

  private loadOrCreate(): SessionMetrics {
    if (existsSync(this.sessionFile)) {
      try {
        const data = JSON.parse(readFileSync(this.sessionFile, 'utf8'));
        data.tools = new Map(Object.entries(data.tools || {}));
        return data;
      } catch { /* ignore */ }
    }

    return {
      sessionId: generateId(),
      startTime: Date.now(),
      totalTurns: 0,
      totalTokensUsed: 0,
      totalTokensSaved: 0,
      reductionPct: 0,
      tools: new Map(),
      errors: 0
    };
  }

  private save(): void {
    try {
      const data = {
        ...this.currentSession,
        tools: Object.fromEntries(this.currentSession.tools)
      };
      writeFileSync(this.sessionFile, JSON.stringify(data, null, 2));
    } catch { /* ignore */ }
  }

  recordToolCall(tool: string, latencyMs: number, tokensIn: number, tokensSaved: number) {
    const existing = this.currentSession.tools.get(tool) || {
      tool,
      count: 0,
      totalLatencyMs: 0,
      avgLatencyMs: 0,
      totalTokensIn: 0,
      totalTokensSaved: 0,
      lastUsed: 0
    };

    existing.count++;
    existing.totalLatencyMs += latencyMs;
    existing.avgLatencyMs = Math.round(existing.totalLatencyMs / existing.count);
    existing.totalTokensIn += tokensIn;
    existing.totalTokensSaved += tokensSaved;
    existing.lastUsed = Date.now();

    this.currentSession.tools.set(tool, existing);
    this.currentSession.totalTokensUsed += tokensIn;
    this.currentSession.totalTokensSaved += tokensSaved;

    if (this.currentSession.totalTokensUsed > 0) {
      this.currentSession.reductionPct = Math.round(
        (this.currentSession.totalTokensSaved / this.currentSession.totalTokensUsed) * 100
      );
    }

    this.save();
  }

  recordError() {
    this.currentSession.errors++;
    this.save();
  }

  incrementTurn() {
    this.currentSession.totalTurns++;
    this.save();
  }

  getSummary(): SessionMetrics {
    return { ...this.currentSession, tools: new Map(this.currentSession.tools) };
  }

  getToolBreakdown(): ToolMetrics[] {
    return Array.from(this.currentSession.tools.values())
      .sort((a, b) => b.count - a.count);
  }

  archiveSession(): string {
    this.currentSession.endTime = Date.now();
    const filename = join(this.metricsDir, `session_${this.currentSession.sessionId}.json`);
    try {
      const data = { ...this.currentSession, tools: Object.fromEntries(this.currentSession.tools) };
      writeFileSync(filename, JSON.stringify(data, null, 2));
    } catch { /* ignore */ }
    return filename;
  }

  getHistorical(limit = 10): SessionMetrics[] {
    try {
      const files = readdirSync(this.metricsDir)
        .filter(f => f.startsWith('session_') && f.endsWith('.json'))
        .sort()
        .reverse()
        .slice(0, limit);

      const sessions: SessionMetrics[] = [];
      for (const f of files) {
        try {
          const data = JSON.parse(readFileSync(join(this.metricsDir, f), 'utf8'));
          data.tools = new Map(Object.entries(data.tools || {}));
          sessions.push(data);
        } catch { continue; }
      }
      return sessions;
    } catch {
      return [];
    }
  }
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}