import { resolve, relative, sep } from 'path';

export class SecurityManager {
  private workspaceRoot: string;

  constructor(workspaceRoot: string = process.cwd()) {
    this.workspaceRoot = resolve(workspaceRoot);
  }

  isPathSafe(requestedPath: string): boolean {
    if (!requestedPath) return false;
    
    if (requestedPath.includes('..')) return false;
    if (requestedPath.startsWith('/') && !requestedPath.startsWith('./')) return false;
    if (/^[A-Za-z]:/.test(requestedPath)) return false;

    try {
      const normalized = resolve(this.workspaceRoot, requestedPath);
      return normalized.startsWith(this.workspaceRoot + sep);
    } catch {
      return false;
    }
  }

  getSafePath(requestedPath: string): string {
    if (!this.isPathSafe(requestedPath)) {
      throw new Error('SECURITY:path_traversal_blocked');
    }
    return resolve(this.workspaceRoot, requestedPath);
  }

  getRelativePath(absolutePath: string): string {
    return relative(this.workspaceRoot, absolutePath);
  }

  validateToolInput(input: Record<string, unknown>, schema: Record<string, unknown>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    for (const [key, rules] of Object.entries(schema)) {
      const value = input[key];
      const rule = rules as any;
      
      if (rule.required && (value === undefined || value === null)) {
        errors.push(`Missing required field: ${key}`);
        continue;
      }
      
      if (value !== undefined && value !== null) {
        if (rule.type && typeof value !== rule.type) {
          errors.push(`Field ${key} must be of type ${rule.type}`);
        }
        
        if (rule.enum && !rule.enum.includes(value)) {
          errors.push(`Field ${key} must be one of: ${rule.enum.join(', ')}`);
        }
        
        if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
          errors.push(`Field ${key} exceeds maximum length of ${rule.maxLength}`);
        }
      }
    }
    
    return { valid: errors.length === 0, errors };
  }
}

export class CircuitBreaker {
  private counters: Map<string, number> = new Map();
  private thresholds: Map<string, number>;
  private windows: Map<string, number[]> = new Map();

  constructor(thresholds: Record<string, number> = {}) {
    this.thresholds = new Map(Object.entries({
      focusBudget: 20,
      topologyCalls: 100,
      searchRefs: 500,
      ...thresholds
    }));
  }

  check(operation: string): { allowed: boolean; message?: string; current?: number; limit?: number } {
    const limit = this.thresholds.get(operation) || 100;
    const current = this.counters.get(operation) || 0;

    if (current >= limit) {
      return {
        allowed: false,
        message: `ERROR:${operation}_limit_exceeded\naction_required:reset_or_wait\ncurrent:${current}\nlimit:${limit}`,
        current,
        limit
      };
    }

    this.counters.set(operation, current + 1);
    return { allowed: true, current: current + 1, limit };
  }

  checkRate(operation: string, maxPerMinute: number): { allowed: boolean; message?: string } {
    const now = Date.now();
    const window = this.windows.get(operation) || [];
    
    const valid = window.filter(t => now - t < 60000);
    valid.push(now);
    this.windows.set(operation, valid);
    
    if (valid.length > maxPerMinute) {
      return {
        allowed: false,
        message: `ERROR:rate_limit_exceeded\noperation:${operation}\nmax_per_minute:${maxPerMinute}`
      };
    }
    
    return { allowed: true };
  }

  reset(operation?: string): void {
    if (operation) {
      this.counters.delete(operation);
      this.windows.delete(operation);
    } else {
      this.counters.clear();
      this.windows.clear();
    }
  }

  getStats(): Record<string, { current: number; limit: number; resetAt?: number }> {
    const stats: Record<string, { current: number; limit: number; resetAt?: number }> = {};
    for (const [op, limit] of this.thresholds) {
      stats[op] = { current: this.counters.get(op) || 0, limit };
    }
    return stats;
  }
}