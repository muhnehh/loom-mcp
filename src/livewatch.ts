import { watch, FSWatcher, WatchEventType } from 'fs';
import { resolve, relative } from 'path';
import { existsSync, readFileSync } from 'fs';

interface WatchConfig {
  debounceMs: number;
  ignoreDirs: string[];
  extensions: string[];
}

const defaultConfig: WatchConfig = {
  debounceMs: 500,
  ignoreDirs: ['node_modules', '.git', 'dist', 'build', 'target', '.loom'],
  extensions: ['ts', 'tsx', 'js', 'jsx', 'py', 'go', 'rs', 'java', 'cs', 'c', 'cpp', 'h', 'hpp']
};

export class LiveWatcher {
  private watchers: Map<string, FSWatcher> = new Map();
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();
  private config: WatchConfig;
  private changeCallback?: (filePath: string, eventType: WatchEventType) => void;
  private reindexCallback?: (filePath: string) => void;

  constructor(config: Partial<WatchConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  watchDirectory(dirPath: string, onChange?: (filePath: string, eventType: WatchEventType) => void): void {
    if (this.watchers.has(dirPath)) {
      return;
    }

    try {
      const watcher = watch(dirPath, { recursive: true }, (eventType, filename) => {
        if (!filename) return;
        
        const fullPath = resolve(dirPath, filename);
        
        if (!this.shouldWatch(fullPath)) return;
        
        this.debouncedEmit(fullPath, eventType);
      });

      this.watchers.set(dirPath, watcher);
      console.error(`Live watch started: ${dirPath}`);
    } catch (error) {
      console.error(`Watch failed for ${dirPath}:`, error);
    }
  }

  private shouldWatch(filePath: string): boolean {
    const relativePath = relative(process.cwd(), filePath);
    const parts = relativePath.split(/[/\\]/);
    
    for (const dir of this.config.ignoreDirs) {
      if (parts.includes(dir)) return false;
    }
    
    const ext = filePath.split('.').pop() || '';
    return this.config.extensions.includes(ext);
  }

  private debouncedEmit(filePath: string, eventType: WatchEventType): void {
    const existing = this.debounceTimers.get(filePath);
    if (existing) {
      clearTimeout(existing);
    }

    const timer = setTimeout(() => {
      this.debounceTimers.delete(filePath);
      
      if (this.changeCallback) {
        this.changeCallback(filePath, eventType);
      }
      
      if (this.reindexCallback && (eventType === 'change' || eventType === 'rename')) {
        if (existsSync(filePath)) {
          try {
            const content = readFileSync(filePath, 'utf8');
            this.reindexCallback(filePath);
            console.error(`File reindexed: ${filePath}`);
          } catch {
            console.error(`Failed to read: ${filePath}`);
          }
        }
      }
    }, this.config.debounceMs);

    this.debounceTimers.set(filePath, timer);
  }

  onFileChange(callback: (filePath: string, eventType: WatchEventType) => void): void {
    this.changeCallback = callback;
  }

  onReindex(callback: (filePath: string) => void): void {
    this.reindexCallback = callback;
  }

  stopWatching(dirPath?: string): void {
    if (dirPath) {
      const watcher = this.watchers.get(dirPath);
      if (watcher) {
        watcher.close();
        this.watchers.delete(dirPath);
      }
    } else {
      for (const [, watcher] of this.watchers) {
        watcher.close();
      }
      this.watchers.clear();
    }
    
    for (const [, timer] of this.debounceTimers) {
      clearTimeout(timer);
    }
    this.debounceTimers.clear();
  }

  getWatchedPaths(): string[] {
    return Array.from(this.watchers.keys());
  }
}