import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';

export interface CacheEntry {
  path: string;
  hash: string;
  skeleton: string;
  lastModified: number;
}

export interface SessionState {
  id: string;
  focusedFiles: Map<string, string>;
  changedFiles: Set<string>;
  startTime: number;
  turns: number;
}

export class LoomCache {
  private cacheDir: string;
  private cacheFile: string;
  private sessionFile: string;
  private entries: Map<string, CacheEntry>;

  constructor(cacheDir: string = '.loom') {
    this.cacheDir = cacheDir;
    this.cacheFile = join(cacheDir, 'state.json');
    this.sessionFile = join(cacheDir, 'session.json');
    this.entries = new Map();
    this.load();
  }

  private load(): void {
    if (existsSync(this.cacheFile)) {
      try {
        const data = JSON.parse(readFileSync(this.cacheFile, 'utf8'));
        for (const [key, value] of Object.entries(data)) {
          this.entries.set(key, value as CacheEntry);
        }
      } catch { /* ignore corrupt cache */ }
    }
    if (!existsSync(this.cacheDir)) {
      mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  private save(): void {
    const data: Record<string, CacheEntry> = {};
    for (const [key, value] of this.entries) {
      data[key] = value;
    }
    writeFileSync(this.cacheFile, JSON.stringify(data, null, 2));
  }

  getOrCompute(filePath: string, compute: () => string): { skeleton: string; cacheHit: boolean } {
    const hash = this.hashFile(filePath);
    const existing = this.entries.get(filePath);

    if (existing && existing.hash === hash) {
      return { skeleton: existing.skeleton, cacheHit: true };
    }

    const skeleton = compute();
    this.entries.set(filePath, {
      path: filePath,
      hash,
      skeleton,
      lastModified: Date.now()
    });
    this.save();
    return { skeleton, cacheHit: false };
  }

  private hashFile(filePath: string): string {
    try {
      const content = readFileSync(filePath, 'utf8');
      return createHash('sha256').update(content + this.getFileModifiedTime(filePath).toString()).digest('hex').slice(0, 16);
    } catch {
      return Date.now().toString();
    }
  }

  private getFileModifiedTime(filePath: string): number {
    try {
      const { mtime } = require('fs').statSync(filePath);
      return mtime.getTime();
    } catch {
      return 0;
    }
  }

  invalidate(filePath: string): void {
    this.entries.delete(filePath);
    this.save();
  }

  clear(): void {
    this.entries.clear();
    this.save();
  }

  get size(): number {
    return this.entries.size;
  }

  getStats(): { entries: number; sizeKb: number } {
    return {
      entries: this.entries.size,
      sizeKb: Math.round(readFileSync(this.cacheFile, 'utf8').length / 1024)
    };
  }
}

export class SessionStateManager {
  private sessionFile: string;
  private state: SessionState;
  private focusedFiles: Map<string, string>;
  private changedFiles: Set<string>;
  private turns: number;

  constructor(sessionFile: string = '.loom/session.json') {
    this.sessionFile = sessionFile;
    this.focusedFiles = new Map();
    this.changedFiles = new Set();
    this.turns = 0;
    this.state = {
      id: Date.now().toString(36),
      focusedFiles: this.focusedFiles,
      changedFiles: this.changedFiles,
      startTime: Date.now(),
      turns: 0
    };
    this.load();
  }

  private load(): void {
    if (existsSync(this.sessionFile)) {
      try {
        const data = JSON.parse(readFileSync(this.sessionFile, 'utf8'));
        this.state.id = data.id || Date.now().toString(36);
        this.state.startTime = data.startTime || Date.now();
        this.turns = data.turns || 0;
        if (data.focusedFiles) {
          for (const [k, v] of Object.entries(data.focusedFiles)) {
            this.focusedFiles.set(k, v as string);
          }
        }
        if (data.changedFiles) {
          this.changedFiles = new Set(data.changedFiles);
        }
      } catch { /* ignore */ }
    }
  }

  private persist(): void {
    const dir = this.sessionFile.includes('/') ? this.sessionFile.split('/').slice(0, -1).join('/') : '.loom';
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(this.sessionFile, JSON.stringify({
      id: this.state.id,
      startTime: this.state.startTime,
      turns: this.turns,
      focusedFiles: Object.fromEntries(this.focusedFiles),
      changedFiles: Array.from(this.changedFiles)
    }, null, 2));
  }

  incrementTurn(): void {
    this.turns++;
    this.persist();
  }

  addFocused(path: string, content: string): void {
    this.focusedFiles.set(path, content);
    this.persist();
  }

  removeFocused(path: string): boolean {
    const result = this.focusedFiles.delete(path);
    this.persist();
    return result;
  }

  markChanged(path: string): void {
    this.changedFiles.add(path);
    this.persist();
  }

  getFocused(): string[] {
    return Array.from(this.focusedFiles.keys());
  }

  getChanged(): string[] {
    return Array.from(this.changedFiles);
  }

  getInfo(): { sessionId: string; turns: number; focused: number; changed: number; elapsed: number } {
    return {
      sessionId: this.state.id,
      turns: this.turns,
      focused: this.focusedFiles.size,
      changed: this.changedFiles.size,
      elapsed: Date.now() - this.state.startTime
    };
  }

  reset(): void {
    this.focusedFiles.clear();
    this.changedFiles.clear();
    this.turns = 0;
    this.state.id = Date.now().toString(36);
    this.state.startTime = Date.now();
    this.persist();
  }
}