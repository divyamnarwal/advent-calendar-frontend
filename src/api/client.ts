const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';
const DEFAULT_TIMEOUT_MS = 10000;
type AuthTokenProvider = () => Promise<string | null>;

let authTokenProvider: AuthTokenProvider | null = null;

export interface ApiError {
  message: string;
  status?: number;
}

export function setAuthTokenProvider(provider: AuthTokenProvider | null): void {
  authTokenProvider = provider;
}

export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {},
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  const controller = options.signal ? null : new AbortController();
  const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;

  try {
    const shouldAttachAuth =
      Boolean(authTokenProvider) && !new Headers(options.headers).has('Authorization');

    const performRequest = async () => {
      const headers = new Headers(options.headers);
      if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
      }

      if (authTokenProvider && !headers.has('Authorization')) {
        const token = await authTokenProvider();
        if (token) {
          headers.set('Authorization', `Bearer ${token}`);
        }
      }

      return fetch(url, {
        ...options,
        signal: options.signal ?? controller?.signal,
        headers,
      });
    };

    let res = await performRequest();

    if (res.status === 401 && shouldAttachAuth) {
      await new Promise((resolve) => setTimeout(resolve, 150));
      res = await performRequest();
    }

    const text = await res.text();

    if (!res.ok) {
      const error: ApiError = {
        message: text || `API Error: ${res.status} ${res.statusText}`,
        status: res.status,
      };
      throw error;
    }

    if (!text) return {} as T;
    return JSON.parse(text);
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw { message: 'Request timed out. Please try again.', status: 408 } satisfies ApiError;
    }
    throw err;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function apiGet<T>(endpoint: string): Promise<T> {
  return apiCall<T>(endpoint, { method: 'GET' });
}

export async function apiPost<T>(endpoint: string, body?: unknown): Promise<T> {
  return apiCall<T>(endpoint, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function apiPut<T>(endpoint: string, body?: unknown): Promise<T> {
  return apiCall<T>(endpoint, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function apiDelete<T>(endpoint: string): Promise<T> {
  return apiCall<T>(endpoint, { method: 'DELETE' });
}

export function getApiBaseUrl(): string {
  return API_BASE;
}
