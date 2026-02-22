import { Router } from 'express';
import { usersRepo } from '../db/repos/users.js';
import { postsRepo } from '../db/repos/posts.js';
import { followsRepo } from '../db/repos/follows.js';
import { notificationsRepo } from '../db/repos/notifications.js';
import { userGamesRepo } from '../db/repos/userGames.js';
import { gamesRepo } from '../db/repos/games.js';
import { requireAuth } from '../middleware/auth.js';
import { shapePost, shapeUser, paramStr } from '../helpers.js';

const router = Router();

router.get('/me/following', requireAuth, (req, res) => {
  const following = followsRepo.getFollowing(req.userId!);
  const users = following
    .map((f) => usersRepo.findById(f.followingId))
    .filter(Boolean) as ReturnType<typeof usersRepo.findById>[];
  res.json({ users: users.map((u) => shapeUser(u!, req.userId)) });
});

router.get('/suggestions', requireAuth, (req, res) => {
  const limit = Math.min(parseInt((req.query.limit as string) || '5', 10) || 5, 20);
  const following = followsRepo.getFollowing(req.userId!);
  const followingIds = new Set(following.map((f) => f.followingId));
  const all = usersRepo.getAll();
  const suggested = all
    .filter((u) => u.id !== req.userId && !followingIds.has(u.id))
    .slice(0, limit);
  res.json({ users: suggested.map((u) => shapeUser(u, req.userId)) });
});

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

router.get('/:username/games', (req, res) => {
  const username = paramStr(req.params.username);
  const user = usersRepo.findByUsername(username);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  const userGames = userGamesRepo.getByUser(user.id);
  const games = gamesRepo.getAll();
  const byId = Object.fromEntries(games.map((g) => [g.id, g]));
  const items = userGames.map((ug) => {
    const game = byId[ug.gameId];
    return {
      ...ug,
      game: game ? { id: game.id, name: game.name, slug: game.slug, iconUrl: game.iconUrl, color: game.color } : null,
    };
  });
  res.json({ userGames: items });
});

export default router;
