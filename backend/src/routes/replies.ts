import { Router } from 'express';
import { z } from 'zod';
import { repliesRepo } from '../db/repos/replies.js';
import { postsRepo } from '../db/repos/posts.js';
import { notificationsRepo } from '../db/repos/notifications.js';
import { usersRepo } from '../db/repos/users.js';
import { requireAuth } from '../middleware/auth.js';
import { paramStr } from '../helpers.js';

const router = Router();
const replySchema = z.object({ content: z.string().min(1).max(280) });

router.post('/:replyId/replies', requireAuth, (req, res) => {
  const replyId = paramStr(req.params.replyId);
  const parent = repliesRepo.findById(replyId);
  if (!parent || parent.deletedAt) {
    res.status(404).json({ error: 'Reply not found' });
    return;
  }
  const parsed = replySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }
  const reply = repliesRepo.create({
    postId: parent.postId,
    parentReplyId: parent.id,
    authorId: req.userId!,
    content: parsed.data.content,
  });
  if (parent.authorId !== req.userId) {
    notificationsRepo.create({
      userId: parent.authorId,
      type: 'REPLY',
      actorId: req.userId!,
      postId: parent.postId,
      replyId: reply.id,
    });
  }
  const post = postsRepo.findById(parent.postId);
  if (post && post.authorId !== req.userId && post.authorId !== parent.authorId) {
    notificationsRepo.create({
      userId: post.authorId,
      type: 'REPLY',
      actorId: req.userId!,
      postId: parent.postId,
      replyId: reply.id,
    });
  }
  const author = usersRepo.findById(req.userId!);
  res.status(201).json({
    reply: {
      id: reply.id,
      postId: reply.postId,
      parentReplyId: reply.parentReplyId,
      content: reply.content,
      deleted: false,
      createdAt: reply.createdAt,
      updatedAt: reply.updatedAt,
      author: author
        ? { id: author.id, username: author.username, displayName: author.displayName, avatarUrl: author.avatarUrl }
        : null,
      canEdit: true,
      canDelete: true,
    },
  });
});

router.patch('/:replyId', requireAuth, (req, res) => {
  const replyId = paramStr(req.params.replyId);
  const reply = repliesRepo.findById(replyId);
  if (!reply || reply.deletedAt) {
    res.status(404).json({ error: 'Reply not found' });
    return;
  }
  if (reply.authorId !== req.userId) {
    res.status(403).json({ error: 'Not authorized' });
    return;
  }
  const parsed = replySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }
  const updated = repliesRepo.update(reply.id, parsed.data.content);
  const author = usersRepo.findById(req.userId!);
  res.json({
    reply: {
      id: updated!.id,
      postId: updated!.postId,
      parentReplyId: updated!.parentReplyId,
      content: updated!.content,
      deleted: false,
      createdAt: updated!.createdAt,
      updatedAt: updated!.updatedAt,
      author: author
        ? { id: author.id, username: author.username, displayName: author.displayName, avatarUrl: author.avatarUrl }
        : null,
      canEdit: true,
      canDelete: true,
    },
  });
});

router.delete('/:replyId', requireAuth, (req, res) => {
  const replyId = paramStr(req.params.replyId);
  const reply = repliesRepo.findById(replyId);
  if (!reply || reply.deletedAt) {
    res.status(404).json({ error: 'Reply not found' });
    return;
  }
  if (reply.authorId !== req.userId) {
    res.status(403).json({ error: 'Not authorized' });
    return;
  }
  repliesRepo.softDelete(reply.id);
  res.json({ ok: true });
});

export default router;
