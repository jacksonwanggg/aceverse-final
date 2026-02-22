const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  auth: {
    register: (data: { username: string; email: string; password: string; displayName?: string }) =>
      apiRequest<{ user: any }>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    login: (data: { email: string; password: string }) =>
      apiRequest<{ user: any }>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    logout: () => apiRequest<{ ok: boolean }>('/auth/logout', { method: 'POST' }),
    me: () => apiRequest<{ user: any | null }>('/auth/me'),
  },
  timeline: {
    home: (cursor?: string) =>
      apiRequest(`/timeline/home${cursor ? `?cursor=${cursor}` : ''}`),
    explore: (cursor?: string) =>
      apiRequest(`/timeline/explore${cursor ? `?cursor=${cursor}` : ''}`),
  },
};
