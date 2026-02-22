import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { resetDb } from '../db/store.js';

describe('Timeline', () => {
  let authCookie: string[];

  beforeAll(async () => {
    resetDb();
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ username: 'feeduser', email: 'feed@test.com', password: 'pass123' });
    const setCookie = reg.headers['set-cookie'];
    authCookie = Array.isArray(setCookie) ? setCookie : setCookie ? [setCookie] : [];
    await request(app)
      .post('/api/posts')
      .set('Cookie', authCookie)
      .send({ content: 'My first post' });
  });

  it('GET /api/timeline/home returns posts for authenticated user', async () => {
    const res = await request(app)
      .get('/api/timeline/home')
      .set('Cookie', authCookie);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('posts');
    expect(res.body).toHaveProperty('nextCursor');
    expect(Array.isArray(res.body.posts)).toBe(true);
    expect(res.body.posts.length).toBeGreaterThanOrEqual(1);
  });

  it('GET /api/timeline/home returns empty when not authenticated', async () => {
    const res = await request(app).get('/api/timeline/home');
    expect(res.status).toBe(200);
    expect(res.body.posts).toEqual([]);
    expect(res.body.nextCursor).toBeNull();
  });

  it('GET /api/timeline/explore returns all posts', async () => {
    const res = await request(app).get('/api/timeline/explore');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('posts');
    expect(res.body).toHaveProperty('nextCursor');
    expect(Array.isArray(res.body.posts)).toBe(true);
  });
});
