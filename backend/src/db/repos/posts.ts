import { v4 as uuid } from 'uuid';
import { getDb, mutate } from '../store.js';
import { Post } from '../types.js';

export const postsRepo = {
  findById(id: string): Post | undefined {
    return getDb().posts.find((p) => p.id === id);
  },

  getByAuthor(authorId: string, cursor?: string, limit = 20): Post[] {
    let posts = getDb()
      .posts.filter((p) => p.authorId === authorId && !p.deletedAt)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (cursor) {
      const idx = posts.findIndex((p) => p.id === cursor);
      if (idx !== -1) posts = posts.slice(idx + 1);
    }
    return posts.slice(0, limit);
  },

  getExplore(cursor?: string, limit = 20): Post[] {
    let posts = getDb()
      .posts.filter((p) => !p.deletedAt)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (cursor) {
      const idx = posts.findIndex((p) => p.id === cursor);
      if (idx !== -1) posts = posts.slice(idx + 1);
    }
    return posts.slice(0, limit);
  },

  getHome(followingIds: string[], userId: string, cursor?: string, limit = 20): Post[] {
    const allIds = new Set([...followingIds, userId]);
    let posts = getDb()
      .posts.filter((p) => allIds.has(p.authorId) && !p.deletedAt)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (cursor) {
      const idx = posts.findIndex((p) => p.id === cursor);
      if (idx !== -1) posts = posts.slice(idx + 1);
    }
    return posts.slice(0, limit);
  },

  search(query: string): Post[] {
    const q = query.toLowerCase();
    return getDb()
      .posts.filter((p) => !p.deletedAt && p.content.toLowerCase().includes(q))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  /** Returns posts ranked by engagement (likes + reposts + replies), optional game filter, cursor pagination. */
  getTrending(
    engagementByPostId: (postId: string) => number,
    options: { game?: string; cursor?: string; limit?: number } = {}
  ): Post[] {
    const { game, cursor, limit = 20 } = options;
    let posts = getDb()
      .posts.filter((p) => !p.deletedAt && (game ? p.gameTag === game : true))
      .slice();
    posts.sort((a, b) => {
      const engA = engagementByPostId(a.id);
      const engB = engagementByPostId(b.id);
      if (engB !== engA) return engB - engA;
      return b.createdAt.localeCompare(a.createdAt);
    });
    if (cursor) {
      const idx = posts.findIndex((p) => p.id === cursor);
      if (idx !== -1) posts = posts.slice(idx + 1);
    }
    return posts.slice(0, limit);
  },

  create(data: { authorId: string; content: string; gameTag?: string | null }): Post {
    const post: Post = {
      id: uuid(),
      authorId: data.authorId,
      content: data.content,
      gameTag: data.gameTag ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: null,
      deletedAt: null,
    };
    mutate((db) => db.posts.push(post));
    return post;
  },

  update(id: string, content: string): Post | undefined {
    let updated: Post | undefined;
    mutate((db) => {
      const post = db.posts.find((p) => p.id === id);
      if (post && !post.deletedAt) {
        post.content = content;
        post.updatedAt = new Date().toISOString();
        updated = post;
      }
    });
    return updated;
  },

  softDelete(id: string): boolean {
    let deleted = false;
    mutate((db) => {
      const post = db.posts.find((p) => p.id === id);
      if (post && !post.deletedAt) {
        post.deletedAt = new Date().toISOString();
        deleted = true;
      }
    });
    return deleted;
  },
};
