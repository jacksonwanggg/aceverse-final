import { v4 as uuid } from 'uuid';
import { getDb, mutate } from '../store.js';
import { User } from '../types.js';

export const usersRepo = {
  findById(id: string): User | undefined {
    return getDb().users.find((u) => u.id === id);
  },

  findByUsername(username: string): User | undefined {
    return getDb().users.find((u) => u.username.toLowerCase() === username.toLowerCase());
  },

  findByEmail(email: string): User | undefined {
    return getDb().users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  },

  search(query: string): User[] {
    const q = query.toLowerCase();
    return getDb().users.filter(
      (u) => u.username.toLowerCase().includes(q) || u.displayName.toLowerCase().includes(q)
    );
  },

  create(data: Omit<User, 'id' | 'createdAt'>): User {
    const existing = getDb().users;
    if (existing.some((u) => u.username.toLowerCase() === data.username.toLowerCase())) {
      throw new Error('Username already taken');
    }
    if (existing.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
      throw new Error('Email already registered');
    }
    const user: User = { id: uuid(), createdAt: new Date().toISOString(), ...data };
    mutate((db) => db.users.push(user));
    return user;
  },

  update(id: string, data: Partial<Pick<User, 'displayName' | 'bio' | 'avatarUrl'>>): User | undefined {
    let updated: User | undefined;
    mutate((db) => {
      const user = db.users.find((u) => u.id === id);
      if (user) {
        Object.assign(user, data);
        updated = user;
      }
    });
    return updated;
  },

  getAll(): User[] {
    return getDb().users;
  },
};
