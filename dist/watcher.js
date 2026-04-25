"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoomWatcher = void 0;
exports.createWatcher = createWatcher;
const fs_1 = require("fs");
const path_1 = require("path");
class LoomWatcher {
    watchers = new Map();
    watchedDirs = new Set();
    callbacks = new Set();
    debounceMs = 100;
    pendingEvents = new Map();
    watchedFiles = new Set();
    constructor(options = {}) {
        if (options.debounceMs) {
            this.debounceMs = options.debounceMs;
        }
    }
    watchDir(dirPath, recursive = true) {
        if (this.watchedDirs.has(dirPath))
            return;
        this.watchedDirs.add(dirPath);
        try {
            const watcher = (0, fs_1.watch)(dirPath, { recursive }, (eventType, filename) => {
                if (filename) {
                    this.handleEvent({
                        type: eventType === 'rename' ? 'created' : 'modified',
                        path: (0, path_1.resolve)(dirPath, filename),
                        timestamp: Date.now()
                    });
                }
            });
            watcher.on('error', (err) => {
                console.error(`Watcher error for ${dirPath}:`, err.message);
                this.unwatchDir(dirPath);
            });
            this.watchers.set(dirPath, watcher);
        }
        catch (err) {
            console.warn(`Failed to watch ${dirPath}: ${err.message}`);
        }
    }
    watchFile(filePath) {
        if (this.watchedFiles.has(filePath))
            return;
        this.watchedFiles.add(filePath);
        try {
            const watcher = (0, fs_1.watch)(filePath, (eventType) => {
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
        }
        catch { /* ignore */ }
    }
    handleEvent(event) {
        const existing = this.pendingEvents.get(event.path);
        if (existing) {
            clearTimeout(existing);
        }
        this.pendingEvents.set(event.path, setTimeout(() => {
            this.pendingEvents.delete(event.path);
            this.emit(event);
        }, this.debounceMs));
    }
    emit(event) {
        for (const callback of this.callbacks) {
            try {
                callback(event);
            }
            catch { /* ignore callback errors */ }
        }
    }
    onEvent(callback) {
        this.callbacks.add(callback);
        return () => this.callbacks.delete(callback);
    }
    unwatchDir(dirPath) {
        const watcher = this.watchers.get(dirPath);
        if (watcher) {
            watcher.close();
            this.watchers.delete(dirPath);
            this.watchedDirs.delete(dirPath);
        }
    }
    unwatchFile(filePath) {
        const watcher = this.watchers.get(filePath);
        if (watcher) {
            watcher.close();
            this.watchers.delete(filePath);
            this.watchedFiles.delete(filePath);
        }
    }
    unwatchAll() {
        for (const watcher of this.watchers.values()) {
            watcher.close();
        }
        this.watchers.clear();
        this.watchedDirs.clear();
        this.watchedFiles.clear();
        this.pendingEvents.clear();
    }
    formatEvent(event) {
        return `cache_invalidated:${event.path}\nreason:external_edit\ntimestamp:${event.timestamp}`;
    }
    getWatchedCount() {
        return {
            dirs: this.watchedDirs.size,
            files: this.watchedFiles.size
        };
    }
}
exports.LoomWatcher = LoomWatcher;
function createWatcher() {
    return new LoomWatcher({ debounceMs: 100 });
}
