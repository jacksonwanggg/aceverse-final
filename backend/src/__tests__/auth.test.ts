import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { resetDb } from '../db/store.js';

describe('Auth', () => {
  beforeAll(() => {
    resetDb();
  });

  it('POST /api/auth/register creates user and returns 201 with user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'player1',
        email: 'p1@test.com',
        password: 'secret123',
        displayName: 'Player One',
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.username).toBe('player1');
    expect(res.body.user.email).toBeUndefined();
    expect(res.body.user.passwordHash).toBeUndefined();
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('POST /api/auth/login returns 200 and sets session cookie', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'logintest', email: 'login@test.com', password: 'pass123' });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@test.com', password: 'pass123' });
    expect(res.status).toBe(200);
    expect(res.body.user.username).toBe('logintest');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('GET /api/auth/me returns user when session valid, null when not', async () => {
    const agent = request.agent(app);
    await agent
      .post('/api/auth/register')
      .send({ username: 'metest', email: 'me@test.com', password: 'pass123' });
    const meRes = await agent.get('/api/auth/me');
    expect(meRes.status).toBe(200);
    expect(meRes.body.user?.username).toBe('metest');

    const noSession = await request(app).get('/api/auth/me');
    expect(noSession.status).toBe(200);
    expect(noSession.body.user).toBeNull();
  });

  it('POST /api/auth/logout clears session and returns ok', async () => {
    const agent = request.agent(app);
    await agent
      .post('/api/auth/register')
      .send({ username: 'logouttest', email: 'logout@test.com', password: 'pass123' });
    const logoutRes = await agent.post('/api/auth/logout');
    expect(logoutRes.status).toBe(200);
    expect(logoutRes.body.ok).toBe(true);
    const meAfter = await agent.get('/api/auth/me');
    expect(meAfter.body.user).toBeNull();
  });
});
