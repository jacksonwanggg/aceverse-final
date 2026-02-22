import { Router } from 'express';
import { getDb } from '../db/store.js';
import { postsRepo } from '../db/repos/posts.js';
import { followsRepo } from '../db/repos/follows.js';
import { gamesRepo } from '../db/repos/games.js';
import { shapePost } from '../helpers.js';

const router = Router();

router.get('/trending-tags', (_req, res) => {
  const posts = getDb().posts.filter((p) => !p.deletedAt && p.gameTag);
  const countBySlug: Record<string, number> = {};
  for (const p of posts) {
    if (p.gameTag) countBySlug[p.gameTag] = (countBySlug[p.gameTag] ?? 0) + 1;
  }
  const games = gamesRepo.getAll();
  const bySlug = Object.fromEntries(games.map((g) => [g.slug, g]));
  const tags = Object.entries(countBySlug)
    .map(([slug, count]) => ({ slug, name: bySlug[slug]?.name ?? slug, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  res.json({ tags });
});

router.get('/home', (req, res) => {
  if (!req.userId) {
    res.json({ posts: [], nextCursor: null });
    return;
  }
  const cursor = req.query.cursor as string | undefined;
  const following = followsRepo.getFollowing(req.userId);
  const followingIds = following.map((f) => f.followingId);
  const posts = postsRepo.getHome(followingIds, req.userId, cursor);
  const nextCursor = posts.length === 20 ? posts[posts.length - 1].id : null;
  res.json({
    posts: posts.map((p) => shapePost(p, req.userId)),
    nextCursor,
  });
});

router.get('/explore', (req, res) => {
  const cursor = req.query.cursor as string | undefined;
  const posts = postsRepo.getExplore(cursor);
  const nextCursor = posts.length === 20 ? posts[posts.length - 1].id : null;
  res.json({
    posts: posts.map((p) => shapePost(p, req.userId)),
    nextCursor,
  });
});

export default router;
