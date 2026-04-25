export interface Config {
  apiUrl: string;
  authToken: string;
  timeout: number;
  retries: number;
}

export class ApiClient {
  private config: Config;
  private baseUrl: string;

  constructor(config: Config) {
    this.config = config;
    this.baseUrl = config.apiUrl;
  }

  async get<T>(path: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'GET',
      headers: this.getHeaders()
    });
    return response.json();
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body)
    });
    return response.json();
  }

  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.authToken}`
    };
  }
}

export interface RequestOptions {
  timeout?: number;
  retries?: number;
}

export async function makeRequest<T>(
  url: string,
  options: RequestOptions = {}
): Promise<T> {
  const timeout = options.timeout || 5000;
  const retries = options.retries || 3;
  
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      return response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
    }
  }
  
  throw new Error('Max retries exceeded');
}