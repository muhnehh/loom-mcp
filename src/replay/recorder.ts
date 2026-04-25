import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export interface SessionRecord {
  ts: number;
  tool: string;
  target: string;
  tokens_in: number;
  tokens_saved: number;
  latency_ms: number;
}

export class SessionRecorder {
  private sessionDir: string;
  private sessionFile: string;
  private records: SessionRecord[] = [];

  constructor(sessionDir: string = '.loom/sessions') {
    this.sessionDir = sessionDir;
    const now = new Date();
    const hash = now.getTime().toString(36).slice(-6);
    this.sessionFile = join(sessionDir, `${now.toISOString().split('T')[0]}-${hash}.jsonl`);
    this.ensureDir();
  }

  private ensureDir(): void {
    if (!existsSync(this.sessionDir)) {
      mkdirSync(this.sessionDir, { recursive: true });
    }
  }

  record(event: Omit<SessionRecord, 'ts'>): void {
    const record: SessionRecord = {
      ts: Date.now(),
      ...event
    };
    this.records.push(record);
    
    try {
      writeFileSync(this.sessionFile, JSON.stringify(record) + '\n', { flag: 'a' });
    } catch (e) {
      console.error('Session record error:', e);
    }
  }

  getTotals() {
    return this.records.reduce((sum, r) => ({
      tokens_used: sum.tokens_used + r.tokens_in,
      tokens_saved: sum.tokens_saved + r.tokens_saved,
      turns: sum.turns + 1
    }), { tokens_used: 0, tokens_saved: 0, turns: 0 });
  }
}

export function createRecorder(): SessionRecorder {
  return new SessionRecorder();
}