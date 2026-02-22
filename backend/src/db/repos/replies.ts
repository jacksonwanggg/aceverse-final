import { v4 as uuid } from 'uuid';
import { getDb, mutate } from '../store.js';
import { Reply } from '../types.js';

export const repliesRepo = {
  findById(id: string): Reply | undefined {
    return getDb().replies.find((r) => r.id === id);
  },

  getByPost(postId: string): Reply[] {
    return getDb()
      .replies.filter((r) => r.postId === postId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  },

  countByPost(postId: string): number {
    return getDb().replies.filter((r) => r.postId === postId && !r.deletedAt).length;
  },

  create(data: { postId: string; parentReplyId: string | null; authorId: string; content: string }): Reply {
    const reply: Reply = {
      id: uuid(),
      postId: data.postId,
      parentReplyId: data.parentReplyId,
      authorId: data.authorId,
      content: data.content,
      createdAt: new Date().toISOString(),
      updatedAt: null,
      deletedAt: null,
    };
    mutate((db) => db.replies.push(reply));
    return reply;
  },

  update(id: string, content: string): Reply | undefined {
    let updated: Reply | undefined;
    mutate((db) => {
      const reply = db.replies.find((r) => r.id === id);
      if (reply && !reply.deletedAt) {
        reply.content = content;
        reply.updatedAt = new Date().toISOString();
        updated = reply;
      }
    });
    return updated;
  },

  softDelete(id: string): boolean {
    let deleted = false;
    mutate((db) => {
      const reply = db.replies.find((r) => r.id === id);
      if (reply && !reply.deletedAt) {
        reply.deletedAt = new Date().toISOString();
        deleted = true;
      }
    });
    return deleted;
  },
};
