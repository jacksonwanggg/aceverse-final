import { v4 as uuid } from 'uuid';
import { getDb, mutate } from '../store.js';
import { Game } from '../types.js';

export const gamesRepo = {
  getAll(): Game[] {
    return getDb().games;
  },

  findById(id: string): Game | undefined {
    return getDb().games.find((g) => g.id === id);
  },

  findBySlug(slug: string): Game | undefined {
    return getDb().games.find((g) => g.slug === slug);
  },

  create(data: Omit<Game, 'id'>): Game {
    const game: Game = { id: uuid(), ...data };
    mutate((db) => db.games.push(game));
    return game;
  },
};
