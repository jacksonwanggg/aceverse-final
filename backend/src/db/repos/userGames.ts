import { v4 as uuid } from 'uuid';
import { getDb, mutate } from '../store.js';
import { UserGame } from '../types.js';

export const userGamesRepo = {
  getByUser(userId: string): UserGame[] {
    return getDb().userGames.filter((ug) => ug.userId === userId);
  },

  find(userId: string, gameId: string): UserGame | undefined {
    return getDb().userGames.find((ug) => ug.userId === userId && ug.gameId === gameId);
  },

  create(data: Omit<UserGame, 'id' | 'updatedAt'>): UserGame {
    const now = new Date().toISOString();
    const userGame: UserGame = { id: uuid(), ...data, updatedAt: now };
    mutate((db) => db.userGames.push(userGame));
    return userGame;
  },

  upsert(userId: string, gameId: string, rank: string, rankTier: string): UserGame {
    const now = new Date().toISOString();
    const existing = getDb().userGames.find((ug) => ug.userId === userId && ug.gameId === gameId);
    if (existing) {
      mutate((db) => {
        const ug = db.userGames.find((u) => u.userId === userId && u.gameId === gameId);
        if (ug) {
          ug.rank = rank;
          ug.rankTier = rankTier;
          ug.updatedAt = now;
        }
      });
      return getDb().userGames.find((ug) => ug.userId === userId && ug.gameId === gameId)!;
    }
    const userGame: UserGame = { id: uuid(), userId, gameId, rank, rankTier, updatedAt: now };
    mutate((db) => db.userGames.push(userGame));
    return userGame;
  },
};
