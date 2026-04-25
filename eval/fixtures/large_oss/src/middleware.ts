import { IncomingMessage, ServerResponse } from 'http';

export type MiddlewareHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> | void;

export interface Request {
  method: string;
  url: string;
  path: string;
  query: Record<string, string>;
  headers: Record<string, string | string[] | undefined>;
  body: unknown;
  params: Record<string, string>;
  files?: Record<string, UploadedFile>;
  ip?: string;
  ips?: string[];
  hostname?: string;
  protocol?: string;
  secure?: boolean;
  originalUrl: string;
  baseUrl: string;
  route: Route;
}

export interface Response {
  statusCode: number;
  statusMessage?: string;
  headers: Record<string, string | string[]>;
  body?: unknown;
  locals: Record<string, unknown>;
  
  status(code: number): this;
  send(body?: unknown): this;
  json(body: unknown): this;
  redirect(url: string, status?: number): this;
  cookie(name: string, value: string, options?: CookieOptions): this;
  clearCookie(name: string, options?: CookieOptions): this;
  set(field: string | Record<string, string>, value?: string): this;
  type(type: string): this;
  append(field: string, value: string): this;
}

export interface CookieOptions {
  domain?: string;
  encode?: (val: string) => string;
  expires?: Date;
  httpOnly?: boolean;
  maxAge?: number;
  path?: string;
  sameSite?: boolean | 'lax' | 'strict';
  secure?: boolean;
}

export interface NextFunction {
  (err?: Error): void;
  (): void;
}

export interface Route {
  path: string;
  method: string;
  handler: MiddlewareHandler | MiddlewareHandler[];
  stack: Layer[];
}

export interface Layer {
  path: string;
  regexp: RegExp;
  params: Record<string, string>;
  keys: string[];
  method: string;
}

export class Router {
  private stack: Route[] = [];
  private paramHandlers: Map<string, MiddlewareHandler> = new Map();

  constructor() {}

  get(path: string, ...handlers: MiddlewareHandler[]): this {
    this.addRoute('GET', path, handlers);
    return this;
  }

  post(path: string, ...handlers: MiddlewareHandler[]): this {
    this.addRoute('POST', path, handlers);
    return this;
  }

  put(path: string, ...handlers: MiddlewareHandler[]): this {
    this.addRoute('PUT', path, handlers);
    return this;
  }

  patch(path: string, ...handlers: MiddlewareHandler[]): this {
    this.addRoute('PATCH', path, handlers);
    return this;
  }

  delete(path: string, ...handlers: MiddlewareHandler[]): this {
    this.addRoute('DELETE', path, handlers);
    return this;
  }

  options(path: string, ...handlers: MiddlewareHandler[]): this {
    this.addRoute('OPTIONS', path, handlers);
    return this;
  }

  all(path: string, ...handlers: MiddlewareHandler[]): this {
    const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];
    for (const method of methods) {
      this.addRoute(method, path, handlers);
    }
    return this;
  }

  use(...handlers: MiddlewareHandler[]): this;
  use(path: string, ...handlers: MiddlewareHandler[]): this;
  use(pathOrHandler: string | MiddlewareHandler, ...handlers: MiddlewareHandler[]): this {
    if (typeof pathOrHandler === 'function') {
      this.addRoute('ALL', '*', [pathOrHandler, ...handlers]);
    } else {
      this.addRoute('ALL', pathOrHandler, handlers);
    }
    return this;
  }

  param(name: string, handler: MiddlewareHandler): this {
    this.paramHandlers.set(name, handler);
    return this;
  }

  private addRoute(method: string, path: string, handlers: MiddlewareHandler[]): void {
    const route: Route = {
      path,
      method,
      handler: handlers,
      stack: []
    };
    this.stack.push(route);
  }

  handle(req: Request, res: Response): void {
    const method = req.method;
    const path = req.path;
    
    for (const route of this.stack) {
      if (route.method !== method && route.method !== 'ALL') continue;
      
      const match = this.matchPath(route.path, path);
      if (match) {
        req.params = match.params;
        this.runHandlers(req, res, route.handler as MiddlewareHandler[]);
        return;
      }
    }
    
    res.status(404).json({ error: 'Not Found' });
  }

  private matchPath(pattern: string, path: string): { params: Record<string, string> } | null {
    const params: Record<string, string> = {};
    
    if (pattern === '*') return { params };
    if (pattern === path) return { params };
    
    const patternParts = pattern.split('/');
    const pathParts = path.split('/');
    
    if (patternParts.length !== pathParts.length) return null;
    
    for (let i = 0; i < patternParts.length; i++) {
      const p = patternParts[i];
      const v = pathParts[i];
      
      if (p.startsWith(':')) {
        params[p.slice(1)] = v;
      } else if (p !== v) {
        return null;
      }
    }
    
    return { params };
  }

  private async runHandlers(
    req: Request,
    res: Response,
    handlers: MiddlewareHandler[]
  ): Promise<void> {
    let index = 0;
    
    const next: NextFunction = (err?: Error) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      if (index >= handlers.length) {
        return;
      }
      
      const handler = handlers[index++];
      Promise.resolve(handler(req, res, next)).catch(err => next(err));
    };
    
    next();
  }

  getRoutes(): Route[] {
    return [...this.stack];
  }
}

export class Application {
  private router: Router;
  private middleware: MiddlewareHandler[] = [];
  private config: AppConfig;

  constructor(config: AppConfig = {}) {
    this.router = new Router();
    this.config = config;
  }

  use(...handlers: MiddlewareHandler[]): this {
    this.middleware.push(...handlers);
    return this;
  }

  get(path: string, ...handlers: MiddlewareHandler[]): this {
    this.router.get(path, ...handlers);
    return this;
  }

  post(path: string, ...handlers: MiddlewareHandler[]): this {
    this.router.post(path, ...handlers);
    return this;
  }

  put(path: string, ...handlers: MiddlewareHandler[]): this {
    this.router.put(path, ...handlers);
    return this;
  }

  delete(path: string, ...handlers: MiddlewareHandler[]): this {
    this.router.delete(path, ...handlers);
    return this;
  }

  param(name: string, handler: MiddlewareHandler): this {
    this.router.param(name, handler);
    return this;
  }

  listen(port: number, callback?: () => void): void {
    console.log(`Server listening on port ${port}`);
    if (callback) callback();
  }
}

export interface AppConfig {
  port?: number;
  host?: string;
  cors?: CorsOptions;
  compression?: boolean;
}

export interface CorsOptions {
  origin?: string | string[] | boolean;
  credentials?: boolean;
  methods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  maxAge?: number;
}

export function createApp(config?: AppConfig): Application {
  return new Application(config);
}

export function createRouter(): Router {
  return new Router();
}