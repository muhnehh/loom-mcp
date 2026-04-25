export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'user' | 'guest';
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: boolean;
  emailDigest: 'daily' | 'weekly' | 'never';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  agreeToTerms: boolean;
}

export class AuthService {
  private baseUrl: string;
  private tokenKey = 'auth_token';
  private userKey = 'auth_user';

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async login(credentials: LoginCredentials): Promise<User> {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });

    if (!response.ok) {
      throw new Error('Invalid credentials');
    }

    const data = await response.json();
    this.setSession(data.token, data.user);
    return data.user;
  }

  async register(data: RegisterData): Promise<User> {
    const response = await fetch(`${this.baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Registration failed');
    }

    const result = await response.json();
    this.setSession(result.token, result.user);
    return result.user;
  }

  async logout(): Promise<void> {
    await fetch(`${this.baseUrl}/auth/logout`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });
    this.clearSession();
  }

  async refreshToken(): Promise<string> {
    const currentToken = this.getToken();
    if (!currentToken) {
      throw new Error('No token to refresh');
    }

    const response = await fetch(`${this.baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ token: currentToken })
    });

    if (!response.ok) {
      this.clearSession();
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    this.setSession(data.token, this.getUser());
    return data.token;
  }

  async verifyToken(token: string): Promise<User | null> {
    const response = await fetch(`${this.baseUrl}/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) return null;
    return response.json();
  }

  async updateProfile(updates: Partial<User>): Promise<User> {
    const response = await fetch(`${this.baseUrl}/users/me`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      throw new Error('Update failed');
    }

    const updatedUser = await response.json();
    localStorage.setItem(this.userKey, JSON.stringify(updatedUser));
    return updatedUser;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/users/me/password`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ currentPassword, newPassword })
    });

    if (!response.ok) {
      throw new Error('Password change failed');
    }
  }

  private setSession(token: string, user: User): void {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  private clearSession(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUser(): User | null {
    const userData = localStorage.getItem(this.userKey);
    return userData ? JSON.parse(userData) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  }
}

export const authService = new AuthService('/api');