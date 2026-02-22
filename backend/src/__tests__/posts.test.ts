import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { resetDb } from '../db/store.js';

describe('Posts', () => {
  let authCookie: string[];
  let postId: string;

  beforeAll(async () => {
    resetDb();
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ username: 'poster', email: 'poster@test.com', password: 'pass123' });
    const setCookie = reg.headers['set-cookie'];
    authCookie = Array.isArray(setCookie) ? setCookie : setCookie ? [setCookie] : [];
    const create = await request(app)
      .post('/api/posts')
      .set('Cookie', authCookie)
      .send({ content: 'Hello world post' });
    postId = create.body.post.id;
  });

  it('POST /api/posts creates post and returns 201', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Cookie', authCookie)
      .send({ content: 'Another post' });
    expect(res.status).toBe(201);
    expect(res.body.post.content).toBe('Another post');
    expect(res.body.post.id).toBeDefined();
  });

  it('GET /api/posts/:postId returns post and replies', async () => {
    const res = await request(app).get(`/api/posts/${postId}`);
    expect(res.status).toBe(200);
    expect(res.body.post.id).toBe(postId);
    expect(res.body.post.content).toBe('Hello world post');
    expect(res.body).toHaveProperty('replies');
  });

  it('PATCH /api/posts/:postId updates post when author', async () => {
    const res = await request(app)
      .patch(`/api/posts/${postId}`)
      .set('Cookie', authCookie)
      .send({ content: 'Updated content' });
    expect(res.status).toBe(200);
    expect(res.body.post.content).toBe('Updated content');
  });

  it('DELETE /api/posts/:postId soft-deletes when author', async () => {
    const create = await request(app)
      .post('/api/posts')
      .set('Cookie', authCookie)
      .send({ content: 'To be deleted' });
    const id = create.body.post.id;
    const res = await request(app)
      .delete(`/api/posts/${id}`)
      .set('Cookie', authCookie);
    expect(res.status).toBe(200);
    const get = await request(app).get(`/api/posts/${id}`);
    expect(get.body.post.deleted).toBe(true);
    expect(get.body.post.content).toBeNull();
  });

  it('POST /api/posts/:postId/like adds like', async () => {
    const create = await request(app)
      .post('/api/posts')
      .set('Cookie', authCookie)
      .send({ content: 'Post to like' });
    const id = create.body.post.id;
    const res = await request(app)
      .post(`/api/posts/${id}/like`)
      .set('Cookie', authCookie);
    expect(res.status).toBe(200);
    expect(res.body.post.likedByMe).toBe(true);
    expect(res.body.post.likeCount).toBeGreaterThanOrEqual(1);
  });

  it('DELETE /api/posts/:postId/like removes like', async () => {
    const create = await request(app)
      .post('/api/posts')
      .set('Cookie', authCookie)
      .send({ content: 'Post to unlike' });
    const id = create.body.post.id;
    await request(app).post(`/api/posts/${id}/like`).set('Cookie', authCookie);
    const res = await request(app)
      .delete(`/api/posts/${id}/like`)
      .set('Cookie', authCookie);
    expect(res.status).toBe(200);
    expect(res.body.post.likedByMe).toBe(false);
  });
});
