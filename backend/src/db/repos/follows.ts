import { v4 as uuid } from 'uuid';
import { getDb, mutate } from '../store.js';
import { Follow } from '../types.js';

export const followsRepo = {
  find(followerId: string, followingId: string): Follow | undefined {
    return getDb().follows.find((f) => f.followerId === followerId && f.followingId === followingId);
  },

  getFollowing(userId: string): Follow[] {
    return getDb().follows.filter((f) => f.followerId === userId);
  },

  getFollowers(userId: string): Follow[] {
    return getDb().follows.filter((f) => f.followingId === userId);
  },

  countFollowing(userId: string): number {
    return getDb().follows.filter((f) => f.followerId === userId).length;
  },

  countFollowers(userId: string): number {
    return getDb().follows.filter((f) => f.followingId === userId).length;
  },

  create(followerId: string, followingId: string): Follow {
    if (getDb().follows.some((f) => f.followerId === followerId && f.followingId === followingId)) {
      throw new Error('Already following');
    }
    const follow: Follow = { id: uuid(), followerId, followingId, createdAt: new Date().toISOString() };
    mutate((db) => db.follows.push(follow));
    return follow;
  },

  remove(followerId: string, followingId: string): boolean {
    let removed = false;
    mutate((db) => {
      const idx = db.follows.findIndex((f) => f.followerId === followerId && f.followingId === followingId);
      if (idx !== -1) {
        db.follows.splice(idx, 1);
        removed = true;
      }
    });
    return removed;
  },
};
