import { v4 as uuid } from 'uuid';
import { getDb, mutate } from '../store.js';
import { Like } from '../types.js';

export const likesRepo = {
  find(userId: string, postId: string): Like | undefined {
    return getDb().likes.find((l) => l.userId === userId && l.postId === postId);
  },

  countByPost(postId: string): number {
    return getDb().likes.filter((l) => l.postId === postId).length;
  },

  create(userId: string, postId: string): Like {
    if (getDb().likes.some((l) => l.userId === userId && l.postId === postId)) {
      throw new Error('Already liked');
    }
    const like: Like = { id: uuid(), userId, postId, createdAt: new Date().toISOString() };
    mutate((db) => db.likes.push(like));
    return like;
  },

  remove(userId: string, postId: string): boolean {
    let removed = false;
    mutate((db) => {
      const idx = db.likes.findIndex((l) => l.userId === userId && l.postId === postId);
      if (idx !== -1) {
        db.likes.splice(idx, 1);
        removed = true;
      }
    });
    return removed;
  },
};
