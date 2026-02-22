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
  posts: {
    create: (data: { content: string; gameTag?: string | null }) =>
      apiRequest<{ post: any }>('/posts', { method: 'POST', body: JSON.stringify(data) }),
    getById: (postId: string) =>
      apiRequest<{ post: any; replies: any[] }>(`/posts/${postId}`),
    update: (postId: string, data: { content: string }) =>
      apiRequest<{ post: any }>(`/posts/${postId}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (postId: string) =>
      apiRequest<{ ok: boolean }>(`/posts/${postId}`, { method: 'DELETE' }),
    like: (postId: string) =>
      apiRequest(`/posts/${postId}/like`, { method: 'POST' }),
    unlike: (postId: string) =>
      apiRequest(`/posts/${postId}/like`, { method: 'DELETE' }),
    repost: (postId: string) =>
      apiRequest(`/posts/${postId}/repost`, { method: 'POST' }),
    unrepost: (postId: string) =>
      apiRequest(`/posts/${postId}/repost`, { method: 'DELETE' }),
  },
  games: {
    getAll: () => apiRequest<{ games: any[] }>('/games'),
  },
  users: {
    getProfile: (username: string) =>
      apiRequest<{ user: any }>(`/users/${encodeURIComponent(username)}`),
    getPosts: (username: string, cursor?: string) =>
      apiRequest<{ posts: any[]; nextCursor: string | null }>(
        `/users/${encodeURIComponent(username)}/posts${cursor ? `?cursor=${cursor}` : ''}`
      ),
    getGames: (username: string) =>
      apiRequest<{ userGames: any[] }>(`/users/${encodeURIComponent(username)}/games`),
    getSuggestions: (limit?: number) =>
      apiRequest<{ users: any[] }>(`/users/suggestions${limit != null ? `?limit=${limit}` : ''}`),
    getFollowing: () => apiRequest<{ users: any[] }>('/users/me/following'),
    follow: (username: string) =>
      apiRequest<{ user: any }>(`/users/${encodeURIComponent(username)}/follow`, { method: 'POST' }),
    unfollow: (username: string) =>
      apiRequest<{ user: any }>(`/users/${encodeURIComponent(username)}/follow`, { method: 'DELETE' }),
  },
  timeline: {
    home: (cursor?: string) =>
      apiRequest<{ posts: any[]; nextCursor: string | null }>(`/timeline/home${cursor ? `?cursor=${cursor}` : ''}`),
    explore: (cursor?: string) =>
      apiRequest<{ posts: any[]; nextCursor: string | null }>(`/timeline/explore${cursor ? `?cursor=${cursor}` : ''}`),
    trendingTags: () =>
      apiRequest<{ tags: { slug: string; name: string; count: number }[] }>('/timeline/trending-tags'),
  },
};
