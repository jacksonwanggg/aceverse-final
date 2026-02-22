const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/** Thrown on API errors; may include field-level errors from validation (e.g. register). */
export class ApiError extends Error {
  status?: number;
  fieldErrors?: Record<string, string[]>;
  constructor(message: string, status?: number, fieldErrors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

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
    const body = await response.json().catch(() => ({ error: 'Request failed' }));
    const err = body.error;
    const message =
      typeof err === 'string'
        ? err
        : typeof err === 'object' && err !== null && !Array.isArray(err)
          ? Object.values(err).flat().join(' ') || `HTTP ${response.status}`
          : `HTTP ${response.status}`;
    const fieldErrors =
      typeof err === 'object' && err !== null && !Array.isArray(err)
        ? (err as Record<string, string[]>)
        : undefined;
    throw new ApiError(message, response.status, fieldErrors);
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
    reply: (postId: string, data: { content: string }) =>
      apiRequest<{ reply: any }>(`/posts/${postId}/replies`, { method: 'POST', body: JSON.stringify(data) }),
  },
  replies: {
    create: (replyId: string, data: { content: string }) =>
      apiRequest<{ reply: any }>(`/replies/${replyId}/replies`, { method: 'POST', body: JSON.stringify(data) }),
    update: (replyId: string, data: { content: string }) =>
      apiRequest<{ reply: any }>(`/replies/${replyId}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (replyId: string) =>
      apiRequest<{ ok: boolean }>(`/replies/${replyId}`, { method: 'DELETE' }),
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
    updateGames: (username: string, userGames: { gameId: string; rank: string; rankTier: string }[]) =>
      apiRequest<{ userGames: any[] }>(`/users/${encodeURIComponent(username)}/games`, {
        method: 'PUT',
        body: JSON.stringify({ userGames }),
      }),
    updateProfile: (username: string, data: { displayName?: string; bio?: string; avatarUrl?: string }) =>
      apiRequest<{ user: any }>(`/users/${encodeURIComponent(username)}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
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
  search: (q: string, type: 'top' | 'people' | 'latest' = 'top') =>
    apiRequest<{ users: any[]; posts: any[] }>(
      `/search?q=${encodeURIComponent(q)}&type=${type}`
    ),
  notifications: {
    getAll: (cursor?: string) =>
      apiRequest<{
        notifications: Array<{
          id: string;
          type: 'LIKE' | 'REPLY' | 'REPOST' | 'FOLLOW';
          read: boolean;
          createdAt: string;
          postId: string | null;
          replyId: string | null;
          actor: { id: string; username: string; displayName: string; avatarUrl: string } | null;
        }>;
        nextCursor: string | null;
        unreadCount: number;
      }>(`/notifications${cursor ? `?cursor=${cursor}` : ''}`),
    markAllRead: () =>
      apiRequest<{ ok: boolean }>('/notifications/mark-all-read', { method: 'POST' }),
    getUnreadCount: () =>
      apiRequest<{ count: number }>('/notifications/unread-count'),
  },
};
