import { v4 as uuid } from 'uuid';
import { getDb, mutate } from '../store.js';
import { Repost } from '../types.js';

export const repostsRepo = {
  find(userId: string, postId: string): Repost | undefined {
    return getDb().reposts.find((r) => r.userId === userId && r.postId === postId);
  },

  countByPost(postId: string): number {
    return getDb().reposts.filter((r) => r.postId === postId).length;
  },

  create(userId: string, postId: string): Repost {
    if (getDb().reposts.some((r) => r.userId === userId && r.postId === postId)) {
      throw new Error('Already reposted');
    }
    const repost: Repost = { id: uuid(), userId, postId, createdAt: new Date().toISOString() };
    mutate((db) => db.reposts.push(repost));
    return repost;
  },

  remove(userId: string, postId: string): boolean {
    let removed = false;
    mutate((db) => {
      const idx = db.reposts.findIndex((r) => r.userId === userId && r.postId === postId);
      if (idx !== -1) {
        db.reposts.splice(idx, 1);
        removed = true;
      }
    });
    return removed;
  },
};
