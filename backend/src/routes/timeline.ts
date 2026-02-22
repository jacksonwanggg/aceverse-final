import { Router } from 'express';
import { postsRepo } from '../db/repos/posts.js';
import { followsRepo } from '../db/repos/follows.js';
import { shapePost } from '../helpers.js';

const router = Router();

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
