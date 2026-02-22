import { Router } from 'express';
import { notificationsRepo } from '../db/repos/notifications.js';
import { usersRepo } from '../db/repos/users.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, (req, res) => {
  const cursor = req.query.cursor as string | undefined;
  const notifications = notificationsRepo.getByUser(req.userId!, cursor);
  const nextCursor = notifications.length === 20 ? notifications[notifications.length - 1].id : null;
  const unreadCount = notificationsRepo.countUnread(req.userId!);

  const shaped = notifications.map((n) => {
    const actor = usersRepo.findById(n.actorId);
    return {
      id: n.id,
      type: n.type,
      read: n.read,
      createdAt: n.createdAt,
      postId: n.postId,
      replyId: n.replyId,
      actor: actor
        ? { id: actor.id, username: actor.username, displayName: actor.displayName, avatarUrl: actor.avatarUrl }
        : null,
    };
  });

  res.json({ notifications: shaped, nextCursor, unreadCount });
});

router.post('/mark-all-read', requireAuth, (req, res) => {
  notificationsRepo.markAllRead(req.userId!);
  res.json({ ok: true });
});

router.get('/unread-count', requireAuth, (req, res) => {
  const count = notificationsRepo.countUnread(req.userId!);
  res.json({ count });
});

export default router;
