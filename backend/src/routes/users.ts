import { Router } from 'express';
import { usersRepo } from '../db/repos/users.js';
import { postsRepo } from '../db/repos/posts.js';
import { followsRepo } from '../db/repos/follows.js';
import { notificationsRepo } from '../db/repos/notifications.js';
import { requireAuth } from '../middleware/auth.js';
import { shapePost, shapeUser, paramStr } from '../helpers.js';

const router = Router();

router.get('/:username', (req, res) => {
  const username = paramStr(req.params.username);
  const user = usersRepo.findByUsername(username);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json({ user: shapeUser(user, req.userId) });
});

router.get('/:username/posts', (req, res) => {
  const username = paramStr(req.params.username);
  const user = usersRepo.findByUsername(username);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  const cursor = req.query.cursor as string | undefined;
  const posts = postsRepo.getByAuthor(user.id, cursor);
  const nextCursor = posts.length === 20 ? posts[posts.length - 1].id : null;
  res.json({
    posts: posts.map((p) => shapePost(p, req.userId)),
    nextCursor,
  });
});

router.post('/:username/follow', requireAuth, (req, res) => {
  const username = paramStr(req.params.username);
  const user = usersRepo.findByUsername(username);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  if (user.id === req.userId) {
    res.status(400).json({ error: 'Cannot follow yourself' });
    return;
  }
  try {
    followsRepo.create(req.userId!, user.id);
    notificationsRepo.create({
      userId: user.id,
      type: 'FOLLOW',
      actorId: req.userId!,
      postId: null,
      replyId: null,
    });
    res.json({ user: shapeUser(user, req.userId) });
  } catch {
    res.status(409).json({ error: 'Already following' });
  }
});

router.delete('/:username/follow', requireAuth, (req, res) => {
  const username = paramStr(req.params.username);
  const user = usersRepo.findByUsername(username);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  followsRepo.remove(req.userId!, user.id);
  res.json({ user: shapeUser(user, req.userId) });
});

export default router;
