import { Database, QueryResult } from './database.js';

export interface QueryPart {
  sql: string;
  params: unknown[];
}

export class QueryBuilder {
  private selectParts: string[] = [];
  private fromPart: string = '';
  private joinParts: QueryPart[] = [];
  private whereParts: QueryPart[] = [];
  private orderByParts: string[] = [];
  private groupByParts: string[] = [];
  private havingPart: QueryPart | null = null;
  private limitValue: number | null = null;
  private offsetValue: number | null = null;
  private insertData: Record<string, unknown> | null = null;
  private updateData: Record<string, unknown> | null = null;

  constructor() {}

  select(...columns: string[]): this {
    this.selectParts = columns.length > 0 ? columns : ['*'];
    return this;
  }

  from(table: string): this {
    this.fromPart = table;
    return this;
  }

  join(table: string, on: string, type: 'INNER' | 'LEFT' | 'RIGHT' = 'INNER'): this {
    this.joinParts.push({
      sql: `${type} JOIN ${table} ON ${on}`,
      params: []
    });
    return this;
  }

  leftJoin(table: string, on: string): this {
    return this.join(table, on, 'LEFT');
  }

  rightJoin(table: string, on: string): this {
    return this.join(table, on, 'RIGHT');
  }

  where(condition: string, params: unknown[] = []): this {
    this.whereParts.push({ sql: condition, params });
    return this;
  }

  andWhere(condition: string, params: unknown[] = []): this {
    if (this.whereParts.length > 0) {
      this.whereParts.push({
        sql: `AND (${condition})`,
        params
      });
    } else {
      return this.where(condition, params);
    }
    return this;
  }

  orWhere(condition: string, params: unknown[] = []): this {
    if (this.whereParts.length > 0) {
      this.whereParts.push({
        sql: `OR (${condition})`,
        params
      });
    } else {
      return this.where(condition, params);
    }
    return this;
  }

  orderBy(column: string, direction: 'ASC' | 'DESC' = 'ASC'): this {
    this.orderByParts.push(`${column} ${direction}`);
    return this;
  }

  groupBy(...columns: string[]): this {
    this.groupByParts.push(...columns);
    return this;
  }

  having(condition: string, params: unknown[] = []): this {
    this.havingPart = { sql: `HAVING ${condition}`, params };
    return this;
  }

  limit(value: number): this {
    this.limitValue = value;
    return this;
  }

  offset(value: number): this {
    this.offsetValue = value;
    return this;
  }

  insert(data: Record<string, unknown>): this {
    this.insertData = data;
    return this;
  }

  update(data: Record<string, unknown>): this {
    this.updateData = data;
    return this;
  }

  toSQL(): QueryPart {
    const params: unknown[] = [];
    let sql = '';

    if (this.insertData) {
      const columns = Object.keys(this.insertData);
      const values = Object.values(this.insertData);
      const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
      
      sql = `INSERT INTO ${this.fromPart} (${columns.join(', ')}) VALUES (${placeholders})`;
      params.push(...values);
    } 
    else if (this.updateData) {
      const set = Object.keys(this.updateData).map((key, i) => `${key} = $${i + 1}`).join(', ');
      const values = Object.values(this.updateData);
      
      sql = `UPDATE ${this.fromPart} SET ${set}`;
      params.push(...values);
      
      if (this.whereParts.length > 0) {
        sql += ' WHERE ';
        for (const w of this.whereParts) {
          sql += w.sql + ' ';
          params.push(...w.params);
        }
      }
    }
    else {
      sql = 'SELECT ';
      sql += this.selectParts.length > 0 ? this.selectParts.join(', ') : '*';
      sql += ` FROM ${this.fromPart}`;
      
      for (const join of this.joinParts) {
        sql += ' ' + join.sql;
      }
      
      if (this.whereParts.length > 0) {
        sql += ' WHERE ';
        let first = true;
        for (const w of this.whereParts) {
          if (!first) sql += ' ';
          sql += w.sql;
          params.push(...w.params);
          first = false;
        }
      }
      
      if (this.groupByParts.length > 0) {
        sql += ' GROUP BY ' + this.groupByParts.join(', ');
      }
      
      if (this.havingPart) {
        sql += ' ' + this.havingPart.sql;
        params.push(...this.havingPart.params);
      }
      
      if (this.orderByParts.length > 0) {
        sql += ' ORDER BY ' + this.orderByParts.join(', ');
      }
      
      if (this.limitValue !== null) {
        sql += ` LIMIT $${params.length + 1}`;
        params.push(this.limitValue);
      }
      
      if (this.offsetValue !== null) {
        sql += ` OFFSET $${params.length + 1}`;
        params.push(this.offsetValue);
      }
    }

    return { sql, params };
  }

  async execute(db: Database): Promise<QueryResult> {
    const { sql, params } = this.toSQL();
    return db.query(sql, params);
  }

  async executeOne<T = Record<string, unknown>>(db: Database): Promise<T | null> {
    const result = await this.limit(1).execute(db);
    return result.rows[0] as T || null;
  }

  toString(): string {
    return this.toSQL().sql;
  }
}

export function select(...columns: string[]): QueryBuilder {
  return new QueryBuilder().select(...columns);
}

export function from(table: string): QueryBuilder {
  return new QueryBuilder().from(table);
}