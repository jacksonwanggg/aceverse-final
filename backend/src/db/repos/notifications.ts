import { v4 as uuid } from 'uuid';
import { getDb, mutate } from '../store.js';
import { Notification } from '../types.js';

export const notificationsRepo = {
  getByUser(userId: string, cursor?: string, limit = 20): Notification[] {
    let notifs = getDb()
      .notifications.filter((n) => n.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (cursor) {
      const idx = notifs.findIndex((n) => n.id === cursor);
      if (idx !== -1) notifs = notifs.slice(idx + 1);
    }
    return notifs.slice(0, limit);
  },

  countUnread(userId: string): number {
    return getDb().notifications.filter((n) => n.userId === userId && !n.read).length;
  },

  create(data: Omit<Notification, 'id' | 'read' | 'createdAt'>): Notification {
    const notif: Notification = {
      id: uuid(),
      read: false,
      createdAt: new Date().toISOString(),
      ...data,
    };
    mutate((db) => db.notifications.push(notif));
    return notif;
  },

  markAllRead(userId: string): void {
    mutate((db) => {
      db.notifications.filter((n) => n.userId === userId && !n.read).forEach((n) => (n.read = true));
    });
  },
};
