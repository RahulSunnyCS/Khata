import { Config } from '../constants/config';
import { Storage } from '../lib/storage';
import { useAuthStore } from '../store/auth.store';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function refreshTokens(): Promise<string | null> {
  const tokens = useAuthStore.getState().tokens;
  if (!tokens?.refreshToken) return null;

  const res = await fetch(`${Config.apiBaseUrl}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: tokens.refreshToken }),
  });

  if (!res.ok) {
    useAuthStore.getState().logout();
    return null;
  }

  const data = await res.json() as { accessToken: string; refreshToken: string; expiresAt: number };
  useAuthStore.getState().setTokens(data);
  await Storage.setSecure('accessToken', data.accessToken);
  await Storage.setSecure('refreshToken', data.refreshToken);
  return data.accessToken;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const accessToken = await Storage.getSecure('accessToken');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${Config.apiBaseUrl}${path}`, { ...options, headers });

  if (res.status === 401 && retry) {
    const newToken = await refreshTokens();
    if (newToken) {
      return request<T>(path, options, false);
    }
    throw new ApiError(401, 'Session expired. Please log in again.', 'UNAUTHORIZED');
  }

  if (!res.ok) {
    let message = 'Something went wrong. Please try again.';
    let code: string | undefined;
    try {
      const body = await res.json() as { message?: string; code?: string };
      message = body.message ?? message;
      code = body.code;
    } catch {
      // ignore parse errors
    }
    throw new ApiError(res.status, message, code);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string, options?: RequestInit) =>
    request<T>(path, { ...options, method: 'GET' }),

  post: <T>(path: string, body?: unknown, options?: RequestInit) =>
    request<T>(path, {
      ...options,
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(path: string, body?: unknown, options?: RequestInit) =>
    request<T>(path, {
      ...options,
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(path: string, options?: RequestInit) =>
    request<T>(path, { ...options, method: 'DELETE' }),
};
