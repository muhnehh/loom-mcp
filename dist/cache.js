"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionStateManager = exports.LoomCache = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const crypto_1 = require("crypto");
class LoomCache {
    cacheDir;
    cacheFile;
    sessionFile;
    entries;
    constructor(cacheDir = '.loom') {
        this.cacheDir = cacheDir;
        this.cacheFile = (0, path_1.join)(cacheDir, 'state.json');
        this.sessionFile = (0, path_1.join)(cacheDir, 'session.json');
        this.entries = new Map();
        this.load();
    }
    load() {
        if ((0, fs_1.existsSync)(this.cacheFile)) {
            try {
                const data = JSON.parse((0, fs_1.readFileSync)(this.cacheFile, 'utf8'));
                for (const [key, value] of Object.entries(data)) {
                    this.entries.set(key, value);
                }
            }
            catch { /* ignore corrupt cache */ }
        }
        if (!(0, fs_1.existsSync)(this.cacheDir)) {
            (0, fs_1.mkdirSync)(this.cacheDir, { recursive: true });
        }
    }
    save() {
        const data = {};
        for (const [key, value] of this.entries) {
            data[key] = value;
        }
        (0, fs_1.writeFileSync)(this.cacheFile, JSON.stringify(data, null, 2));
    }
    getOrCompute(filePath, compute) {
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
    hashFile(filePath) {
        try {
            const content = (0, fs_1.readFileSync)(filePath, 'utf8');
            return (0, crypto_1.createHash)('sha256').update(content + this.getFileModifiedTime(filePath).toString()).digest('hex').slice(0, 16);
        }
        catch {
            return Date.now().toString();
        }
    }
    getFileModifiedTime(filePath) {
        try {
            const { mtime } = require('fs').statSync(filePath);
            return mtime.getTime();
        }
        catch {
            return 0;
        }
    }
    invalidate(filePath) {
        this.entries.delete(filePath);
        this.save();
    }
    clear() {
        this.entries.clear();
        this.save();
    }
    get size() {
        return this.entries.size;
    }
    getStats() {
        return {
            entries: this.entries.size,
            sizeKb: Math.round((0, fs_1.readFileSync)(this.cacheFile, 'utf8').length / 1024)
        };
    }
}
exports.LoomCache = LoomCache;
class SessionStateManager {
    sessionFile;
    state;
    focusedFiles;
    changedFiles;
    turns;
    constructor(sessionFile = '.loom/session.json') {
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
    load() {
        if ((0, fs_1.existsSync)(this.sessionFile)) {
            try {
                const data = JSON.parse((0, fs_1.readFileSync)(this.sessionFile, 'utf8'));
                this.state.id = data.id || Date.now().toString(36);
                this.state.startTime = data.startTime || Date.now();
                this.turns = data.turns || 0;
                if (data.focusedFiles) {
                    for (const [k, v] of Object.entries(data.focusedFiles)) {
                        this.focusedFiles.set(k, v);
                    }
                }
                if (data.changedFiles) {
                    this.changedFiles = new Set(data.changedFiles);
                }
            }
            catch { /* ignore */ }
        }
    }
    persist() {
        const dir = this.sessionFile.includes('/') ? this.sessionFile.split('/').slice(0, -1).join('/') : '.loom';
        if (!(0, fs_1.existsSync)(dir)) {
            (0, fs_1.mkdirSync)(dir, { recursive: true });
        }
        (0, fs_1.writeFileSync)(this.sessionFile, JSON.stringify({
            id: this.state.id,
            startTime: this.state.startTime,
            turns: this.turns,
            focusedFiles: Object.fromEntries(this.focusedFiles),
            changedFiles: Array.from(this.changedFiles)
        }, null, 2));
    }
    incrementTurn() {
        this.turns++;
        this.persist();
    }
    addFocused(path, content) {
        this.focusedFiles.set(path, content);
        this.persist();
    }
    removeFocused(path) {
        const result = this.focusedFiles.delete(path);
        this.persist();
        return result;
    }
    markChanged(path) {
        this.changedFiles.add(path);
        this.persist();
    }
    getFocused() {
        return Array.from(this.focusedFiles.keys());
    }
    getChanged() {
        return Array.from(this.changedFiles);
    }
    getInfo() {
        return {
            sessionId: this.state.id,
            turns: this.turns,
            focused: this.focusedFiles.size,
            changed: this.changedFiles.size,
            elapsed: Date.now() - this.state.startTime
        };
    }
    reset() {
        this.focusedFiles.clear();
        this.changedFiles.clear();
        this.turns = 0;
        this.state.id = Date.now().toString(36);
        this.state.startTime = Date.now();
        this.persist();
    }
}
exports.SessionStateManager = SessionStateManager;
