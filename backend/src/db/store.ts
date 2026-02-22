import fs from 'fs';
import path from 'path';
import { Database } from './types.js';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'db', 'data');
const DB_PATH = path.join(DATA_DIR, 'aceverse.db.json');

const emptyDb: Database = {
  users: [],
  posts: [],
  replies: [],
  likes: [],
  reposts: [],
  follows: [],
  notifications: [],
  sessions: [],
};

let db: Database;

function loadFromDisk(): Database {
  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, 'utf-8');
      return JSON.parse(raw) as Database;
    }
  } catch {
    console.warn('Failed to load DB from disk, starting fresh');
  }
  return structuredClone(emptyDb);
}

let flushTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleDiskFlush(): void {
  if (flushTimer) clearTimeout(flushTimer);
  flushTimer = setTimeout(() => {
    flushToDisk();
    flushTimer = null;
  }, 200);
}

export function flushToDisk(): void {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
}

export function getDb(): Database {
  return db;
}

export function mutate(fn: (db: Database) => void): void {
  fn(db);
  scheduleDiskFlush();
}

export function resetDb(): void {
  db = structuredClone(emptyDb);
  flushToDisk();
}

db = loadFromDisk();
