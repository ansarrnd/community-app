const TOKEN_KEY = 'community.go.jwt';

function apiBase(): string {
  return (process.env.EXPO_PUBLIC_GO_API_URL || 'http://127.0.0.1:8088').replace(/\/$/, '');
}

export function getGoApiToken(): string | null {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return memoryToken;
}

let memoryToken: string | null = null;

export function setGoApiToken(token: string | null): void {
  memoryToken = token;
  if (typeof localStorage !== 'undefined') {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  }
}

export class GoApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'GoApiError';
  }
}

export async function goFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const token = getGoApiToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${apiBase()}${path}`, { ...init, headers });
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new GoApiError(res.status, data?.code ?? 'error', data?.error ?? res.statusText);
  }
  return data as T;
}

