export function loginUser(email: string, password: string): Promise<User> {
  return authService.verify(email, password);
}

export function verifyJWT(token: string): JWTPayload | null {
  return jwt.verify(token);
}

export async function refreshToken(token: string): Promise<string> {
  const payload = jwt.verify(token);
  return jwt.sign(payload);
}

type User = {
  id: string;
  email: string;
  role: 'admin' | 'user';
  created_at: Date;
};

interface JWTPayload {
  sub: string;
  iat: number;
  exp: number;
  role: string;
}