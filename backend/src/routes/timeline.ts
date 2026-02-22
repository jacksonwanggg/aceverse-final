import { Router } from 'express';
import { getDb } from '../db/store.js';
import { postsRepo } from '../db/repos/posts.js';
import { followsRepo } from '../db/repos/follows.js';
import { gamesRepo } from '../db/repos/games.js';
import { likesRepo } from '../db/repos/likes.js';
import { repostsRepo } from '../db/repos/reposts.js';
import { repliesRepo } from '../db/repos/replies.js';
import { shapePost } from '../helpers.js';

const router = Router();

function engagementByPostId(postId: string): number {
  return (
    likesRepo.countByPost(postId) +
    repostsRepo.countByPost(postId) +
    repliesRepo.countByPost(postId)
  );
}

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

router.get('/trending', (req, res) => {
  const cursor = req.query.cursor as string | undefined;
  const game = (req.query.game as string) || undefined;
  const posts = postsRepo.getTrending(engagementByPostId, { game, cursor, limit: 20 });
  const shaped = posts.map((p) => shapePost(p, req.userId));
  const nextCursor = posts.length === 20 ? posts[posts.length - 1].id : null;
  const totalLikes = shaped.reduce((sum, p) => sum + (p.likeCount ?? 0), 0);
  const lastUpdated =
    shaped.length > 0
      ? shaped.reduce((latest, p) => (p.createdAt > latest ? p.createdAt : latest), shaped[0].createdAt)
      : new Date().toISOString();
  res.json({
    posts: shaped,
    nextCursor,
    hotClipsCount: shaped.length,
    totalLikes,
    lastUpdated,
  });
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
