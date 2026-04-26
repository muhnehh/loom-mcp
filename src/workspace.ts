import Database from 'better-sqlite3';
import { resolve, dirname } from 'path';
import { existsSync, mkdirSync } from 'fs';

interface SymbolEntry {
  id?: number;
  name: string;
  kind: string;
  file: string;
  lineStart: number;
  lineEnd: number;
  signature: string;
  content: string;
  repo: string;
}

export class SQLiteWorkspace {
  private db: Database.Database;
  private dbPath: string;

  constructor(cacheDir: string = '.loom') {
    if (!existsSync(cacheDir)) {
      mkdirSync(cacheDir, { recursive: true });
    }
    
    this.dbPath = resolve(cacheDir, 'workspace.db');
    this.db = new Database(this.dbPath);
    this.initTables();
  }

  private initTables(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS symbols (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        kind TEXT NOT NULL,
        file TEXT NOT NULL,
        lineStart INTEGER,
        lineEnd INTEGER,
        signature TEXT,
        content TEXT,
        repo TEXT DEFAULT 'main'
      );
      
      CREATE INDEX IF NOT EXISTS idx_symbol_name ON symbols(name);
      CREATE INDEX IF NOT EXISTS idx_symbol_file ON symbols(file);
      CREATE INDEX IF NOT EXISTS idx_symbol_repo ON symbols(repo);
      
      CREATE VIRTUAL TABLE IF NOT EXISTS symbols_fts USING fts5(
        name, signature, content,
        content='symbols',
        content_rowid='id'
      );
      
      CREATE TABLE IF NOT EXISTS repos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        path TEXT NOT NULL,
        last_indexed INTEGER
      );
      
      CREATE TABLE IF NOT EXISTS embeddings (
        id INTEGER PRIMARY KEY,
        text TEXT NOT NULL,
        embedding BLOB,
        FOREIGN KEY(id) REFERENCES symbols(id) ON DELETE CASCADE
      );
    `);
  }

  addSymbols(symbols: SymbolEntry[]): number {
    const stmt = this.db.prepare(`
      INSERT INTO symbols (name, kind, file, lineStart, lineEnd, signature, content, repo)
      VALUES (@name, @kind, @file, @lineStart, @lineEnd, @signature, @content, @repo)
    `);

    const insertMany = this.db.transaction((syms: SymbolEntry[]) => {
      for (const sym of syms) {
        stmt.run(sym);
      }
      return syms.length;
    });

    return insertMany(symbols);
  }

  searchSymbols(query: string, limit: number = 20, repo: string = 'main'): SymbolEntry[] {
    const stmt = this.db.prepare(`
      SELECT * FROM symbols
      WHERE name LIKE ? AND repo = ?
      ORDER BY name
      LIMIT ?
    `);
    
    return stmt.all(`%${query}%`, repo, limit) as SymbolEntry[];
  }

  searchFTS(query: string, limit: number = 20): any[] {
    try {
      const stmt = this.db.prepare(`
        SELECT s.*, rank
        FROM symbols s
        JOIN symbols_fts f ON s.id = f.rowid
        WHERE symbols_fts MATCH ?
        ORDER BY rank
        LIMIT ?
      `);
      return stmt.all(query, limit);
    } catch {
      return this.searchSymbols(query, limit);
    }
  }

  getSymbolsByFile(file: string): SymbolEntry[] {
    const stmt = this.db.prepare('SELECT * FROM symbols WHERE file = ?');
    return stmt.all(file) as SymbolEntry[];
  }

  addRepo(name: string, path: string): number {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO repos (name, path, last_indexed)
      VALUES (?, ?, ?)
    `);
    return stmt.run(name, path, Date.now()).lastInsertRowid as number;
  }

  getRepos(): { name: string; path: string; last_indexed: number }[] {
    const stmt = this.db.prepare('SELECT name, path, last_indexed FROM repos');
    return stmt.all() as any[];
  }

  clearRepo(repo: string = 'main'): void {
    this.db.prepare('DELETE FROM symbols WHERE repo = ?').run(repo);
  }

  getStats(): { symbols: number; repos: number; size_kb: number } {
    const count = this.db.prepare('SELECT COUNT(*) as count FROM symbols').get() as any;
    const repos = this.db.prepare('SELECT COUNT(*) as count FROM repos').get() as any;
    const size = require('fs').statSync(this.dbPath).size / 1024;
    
    return {
      symbols: count.count,
      repos: repos.count,
      size_kb: Math.round(size)
    };
  }

  close(): void {
    this.db.close();
  }
}