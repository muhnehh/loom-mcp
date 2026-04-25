export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface AuthToken {
  token: string;
  refreshToken: string;
  expiresAt: Date;
}

export async function loginUser(email: string, password: string): Promise<AuthToken> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  return response.json();
}

export async function refreshToken(token: string): Promise<AuthToken> {
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ token })
  });
  return response.json();
}

export async function verifyToken(token: string): Promise<User | null> {
  const response = await fetch('/api/auth/verify', {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) return null;
  return response.json();
}

export async function logout(token: string): Promise<void> {
  await fetch('/api/auth/logout', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });
}