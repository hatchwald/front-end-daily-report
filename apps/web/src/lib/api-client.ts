import { environment } from '@/lib/env';

interface ApiErrorBody {
  code?: string;
  message?: string;
  error?: { code?: string; message?: string };
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string | undefined;
  readonly requestId: string | undefined;

  constructor(message: string, status: number, code?: string, requestId?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.requestId = requestId;
  }
}

interface RequestOptions {
  body?: unknown;
  signal?: AbortSignal;
}

async function request<T>(path: string, method: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers({ Accept: 'application/json' });
  if (options.body !== undefined) headers.set('Content-Type', 'application/json');

  const response = await fetch(new URL(path, environment.VITE_API_BASE_URL), {
    method,
    headers,
    credentials: 'include',
    ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
    ...(options.signal ? { signal: options.signal } : {}),
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => ({}))) as ApiErrorBody;
    const apiError = errorBody.error ?? errorBody;
    if (response.status === 401 && path !== '/api/v1/auth/me' && path !== '/api/v1/auth/login') {
      window.dispatchEvent(new Event('devlog:session-expired'));
    }
    throw new ApiError(
      apiError.message ?? 'The request could not be completed.',
      response.status,
      apiError.code,
      response.headers.get('x-request-id') ?? undefined,
    );
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const apiClient = {
  get: <T>(path: string, signal?: AbortSignal) => request<T>(path, 'GET', signal ? { signal } : {}),
  post: <T>(path: string, body?: unknown, signal?: AbortSignal) =>
    request<T>(path, 'POST', {
      ...(body !== undefined ? { body } : {}),
      ...(signal ? { signal } : {}),
    }),
  patch: <T>(path: string, body: unknown, signal?: AbortSignal) =>
    request<T>(path, 'PATCH', { body, ...(signal ? { signal } : {}) }),
  delete: <T>(path: string, signal?: AbortSignal) =>
    request<T>(path, 'DELETE', signal ? { signal } : {}),
};
