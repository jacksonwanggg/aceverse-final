import { Router } from 'express';
import { usersRepo } from '../db/repos/users.js';
import { postsRepo } from '../db/repos/posts.js';
import { shapePost, shapeUser } from '../helpers.js';

const router = Router();

router.get('/', (req, res) => {
  const q = (req.query.q as string) || '';
  const type = (req.query.type as string) || 'top';

  if (!q.trim()) {
    res.json({ users: [], posts: [] });
    return;
  }

  if (type === 'people') {
    const users = usersRepo.search(q).slice(0, 20);
    res.json({ users: users.map((u) => shapeUser(u, req.userId)), posts: [] });
    return;
  }

  if (type === 'latest') {
    const posts = postsRepo.search(q).slice(0, 20);
    res.json({ users: [], posts: posts.map((p) => shapePost(p, req.userId)) });
    return;
  }

  // "top" - return both
  const users = usersRepo.search(q).slice(0, 5);
  const posts = postsRepo.search(q).slice(0, 20);
  res.json({
    users: users.map((u) => shapeUser(u, req.userId)),
    posts: posts.map((p) => shapePost(p, req.userId)),
  });
});

export default router;
