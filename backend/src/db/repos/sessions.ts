import { v4 as uuid } from 'uuid';
import { getDb, mutate } from '../store.js';
import { Session } from '../types.js';

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export const sessionsRepo = {
  findById(id: string): Session | undefined {
    const session = getDb().sessions.find((s) => s.id === id);
    if (session && new Date(session.expiresAt) < new Date()) {
      sessionsRepo.remove(id);
      return undefined;
    }
    return session;
  },

  create(userId: string): Session {
    const session: Session = {
      id: uuid(),
      userId,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
    };
    mutate((db) => db.sessions.push(session));
    return session;
  },

  remove(id: string): void {
    mutate((db) => {
      const idx = db.sessions.findIndex((s) => s.id === id);
      if (idx !== -1) db.sessions.splice(idx, 1);
    });
  },

  removeByUser(userId: string): void {
    mutate((db) => {
      db.sessions = db.sessions.filter((s) => s.userId !== userId);
    });
  },
};
