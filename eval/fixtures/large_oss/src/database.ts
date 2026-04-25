import { QueryBuilder } from './query.js';

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
  pool?: PoolConfig;
}

export interface PoolConfig {
  min: number;
  max: number;
  idleTimeoutMs: number;
  connectionTimeoutMs: number;
}

export interface QueryOptions {
  timeout?: number;
  logger?: QueryLogger;
}

export interface QueryLogger {
  log(sql: string, duration: number): void;
}

export interface QueryResult<T = unknown> {
  rows: T[];
  rowCount: number;
  fields: FieldInfo[];
}

export interface FieldInfo {
  name: string;
  type: string;
  nullable: boolean;
}

export class Database {
  private config: DatabaseConfig;
  private pool: any;
  private connected: boolean = false;

  constructor(config: DatabaseConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    if (this.connected) return;
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    if (!this.connected) return;
    this.connected = false;
  }

  async query<T = Record<string, unknown>>(
    sql: string,
    params?: unknown[],
    options?: QueryOptions
  ): Promise<QueryResult<T>> {
    const start = Date.now();
    
    try {
      const result = await this.executeQuery<T>(sql, params);
      const duration = Date.now() - start;
      
      if (options?.logger) {
        options.logger.log(sql, duration);
      }
      
      return result;
    } catch (error) {
      throw new Error(`Query failed: ${error}`);
    }
  }

  private async executeQuery<T>(
    sql: string,
    params?: unknown[]
  ): Promise<QueryResult<T>> {
    return { rows: [] as T[], rowCount: 0, fields: [] };
  }

  async transaction<T>(
    callback: (tx: Transaction) => Promise<T>
  ): Promise<T> {
    const tx = new Transaction(this);
    try {
      await tx.begin();
      const result = await callback(tx);
      await tx.commit();
      return result;
    } catch (error) {
      await tx.rollback();
      throw error;
    }
  }

  getQueryBuilder(): QueryBuilder {
    return new QueryBuilder();
  }

  isConnected(): boolean {
    return this.connected;
  }
}

export class Transaction {
  private db: Database;
  private committed: boolean = false;
  private rolledBack: boolean = false;

  constructor(db: Database) {
    this.db = db;
  }

  async begin(): Promise<void> {}
  async commit(): Promise<void> { this.committed = true; }
  async rollback(): Promise<void> { this.rolledBack = true; }

  async query<T = Record<string, unknown>>(
    sql: string,
    params?: unknown[]
  ): Promise<QueryResult<T>> {
    return this.db.query(sql, params);
  }
}

export class Repository<T extends Record<string, unknown>> {
  constructor(
    private db: Database,
    private tableName: string
  ) {}

  async findById(id: string): Promise<T | null> {
    const result = await this.db.query<T>(
      `SELECT * FROM ${this.tableName} WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async findOne(conditions: Partial<T>): Promise<T | null> {
    const entries = Object.entries(conditions);
    const where = entries.map((e, i) => `${e[0]} = $${i + 1}`).join(' AND ');
    const values = entries.map(e => e[1]);
    
    const result = await this.db.query<T>(
      `SELECT * FROM ${this.tableName} WHERE ${where} LIMIT 1`,
      values
    );
    return result.rows[0] || null;
  }

  async findAll(conditions?: Partial<T>): Promise<T[]> {
    if (!conditions) {
      const result = await this.db.query<T>(
        `SELECT * FROM ${this.tableName}`
      );
      return result.rows;
    }
    
    const entries = Object.entries(conditions);
    const where = entries.map((e, i) => `${e[0]} = $${i + 1}`).join(' AND ');
    const values = entries.map(e => e[1]);
    
    const result = await this.db.query<T>(
      `SELECT * FROM ${this.tableName} WHERE ${where}`,
      values
    );
    return result.rows;
  }

  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    const id = this.generateId();
    const now = new Date();
    
    const entry = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now
    } as T;
    
    const keys = Object.keys(entry);
    const values = Object.values(entry);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    
    await this.db.query(
      `INSERT INTO ${this.tableName} (${keys.join(', ')}) VALUES (${placeholders})`,
      values
    );
    
    return entry;
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    const existing = await this.findById(id);
    if (!existing) return null;
    
    const updates = Object.entries(data).filter(([k]) => k !== 'id');
    const set = updates.map((e, i) => `${e[0]} = $${i + 1}`).join(', ');
    const values = [...updates.map(e => e[1]), id];
    
    await this.db.query(
      `UPDATE ${this.tableName} SET ${set}, updatedAt = NOW() WHERE id = $${values.length}`,
      values
    );
    
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.query(
      `DELETE FROM ${this.tableName} WHERE id = $1`,
      [id]
    );
    return result.rowCount > 0;
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }
}

export function createDatabase(config: DatabaseConfig): Database {
  return new Database(config);
}