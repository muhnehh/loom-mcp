import { watch, FSWatcher } from 'fs';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

export interface WatchEvent {
  type: 'modified' | 'deleted' | 'created';
  path: string;
  timestamp: number;
  agentId?: string;
}

type EventCallback = (event: WatchEvent) => void;

export class LoomWatcher {
  private watchers: Map<string, FSWatcher> = new Map();
  private watchedDirs: Set<string> = new Set();
  private callbacks: Set<EventCallback> = new Set();
  private debounceMs: number = 100;
  private pendingEvents: Map<string, NodeJS.Timeout> = new Map();
  private watchedFiles: Set<string> = new Set();

  constructor(options: { debounceMs?: number } = {}) {
    if (options.debounceMs) {
      this.debounceMs = options.debounceMs;
    }
  }

  watchDir(dirPath: string, recursive: boolean = true): void {
    if (this.watchedDirs.has(dirPath)) return;
    this.watchedDirs.add(dirPath);

    try {
      const watcher = watch(dirPath, { recursive }, (eventType, filename) => {
        if (filename) {
          this.handleEvent({
            type: eventType === 'rename' ? 'created' : 'modified',
            path: resolve(dirPath, filename),
            timestamp: Date.now()
          });
        }
      });

      watcher.on('error', (err) => {
        console.error(`Watcher error for ${dirPath}:`, err.message);
        this.unwatchDir(dirPath);
      });

      this.watchers.set(dirPath, watcher);
    } catch (err: any) {
      console.warn(`Failed to watch ${dirPath}: ${err.message}`);
    }
  }

  watchFile(filePath: string): void {
    if (this.watchedFiles.has(filePath)) return;
    this.watchedFiles.add(filePath);

    try {
      const watcher = watch(filePath, (eventType) => {
        this.handleEvent({
          type: eventType === 'rename' ? 'deleted' : 'modified',
          path: filePath,
          timestamp: Date.now()
        });
      });

      watcher.on('error', () => {
        this.watchedFiles.delete(filePath);
      });

      this.watchers.set(filePath, watcher);
    } catch { /* ignore */ }
  }

  private handleEvent(event: WatchEvent): void {
    const existing = this.pendingEvents.get(event.path);
    if (existing) {
      clearTimeout(existing);
    }

    this.pendingEvents.set(event.path, setTimeout(() => {
      this.pendingEvents.delete(event.path);
      this.emit(event);
    }, this.debounceMs));
  }

  private emit(event: WatchEvent): void {
    for (const callback of this.callbacks) {
      try {
        callback(event);
      } catch { /* ignore callback errors */ }
    }
  }

  onEvent(callback: EventCallback): () => void {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  unwatchDir(dirPath: string): void {
    const watcher = this.watchers.get(dirPath);
    if (watcher) {
      watcher.close();
      this.watchers.delete(dirPath);
      this.watchedDirs.delete(dirPath);
    }
  }

  unwatchFile(filePath: string): void {
    const watcher = this.watchers.get(filePath);
    if (watcher) {
      watcher.close();
      this.watchers.delete(filePath);
      this.watchedFiles.delete(filePath);
    }
  }

  unwatchAll(): void {
    for (const watcher of this.watchers.values()) {
      watcher.close();
    }
    this.watchers.clear();
    this.watchedDirs.clear();
    this.watchedFiles.clear();
    this.pendingEvents.clear();
  }

  formatEvent(event: WatchEvent): string {
    return `cache_invalidated:${event.path}\nreason:external_edit\ntimestamp:${event.timestamp}`;
  }

  getWatchedCount(): { dirs: number; files: number } {
    return {
      dirs: this.watchedDirs.size,
      files: this.watchedFiles.size
    };
  }
}

export function createWatcher(): LoomWatcher {
  return new LoomWatcher({ debounceMs: 100 });
}