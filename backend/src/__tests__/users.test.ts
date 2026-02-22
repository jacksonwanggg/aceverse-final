import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { resetDb } from '../db/store.js';

describe('Users', () => {
  let userACookie: string[];
  let userBCookie: string[];

  beforeAll(async () => {
    resetDb();
    const a = await request(app)
      .post('/api/auth/register')
      .send({ username: 'userA', email: 'a@test.com', password: 'pass123' });
    const setA = a.headers['set-cookie'];
    userACookie = Array.isArray(setA) ? setA : setA ? [setA] : [];
    const b = await request(app)
      .post('/api/auth/register')
      .send({ username: 'userB', email: 'b@test.com', password: 'pass123' });
    const setB = b.headers['set-cookie'];
    userBCookie = Array.isArray(setB) ? setB : setB ? [setB] : [];
  });

  it('GET /api/users/:username returns profile', async () => {
    const res = await request(app).get('/api/users/userA');
    expect(res.status).toBe(200);
    expect(res.body.user.username).toBe('userA');
    expect(res.body.user).toHaveProperty('followerCount');
    expect(res.body.user).toHaveProperty('followingCount');
  });

  it('POST /api/users/:username/follow and DELETE unfollow', async () => {
    const followRes = await request(app)
      .post('/api/users/userA/follow')
      .set('Cookie', userBCookie);
    expect(followRes.status).toBe(200);
    expect(followRes.body.user.isFollowing).toBe(true);

    const profileAfter = await request(app)
      .get('/api/users/userA')
      .set('Cookie', userBCookie);
    expect(profileAfter.body.user.isFollowing).toBe(true);

    const unfollowRes = await request(app)
      .delete('/api/users/userA/follow')
      .set('Cookie', userBCookie);
    expect(unfollowRes.status).toBe(200);
    expect(unfollowRes.body.user.isFollowing).toBe(false);
  });

  it('GET /api/users/:username/posts returns user posts', async () => {
    await request(app)
      .post('/api/posts')
      .set('Cookie', userACookie)
      .send({ content: 'User A post' });
    const res = await request(app).get('/api/users/userA/posts');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('posts');
    expect(res.body.posts.length).toBeGreaterThanOrEqual(1);
  });

  it('GET /api/users/:username returns 404 for unknown username', async () => {
    await request(app).get('/api/users/nonexistentuser123').expect(404);
  });
});
