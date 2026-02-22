import { Router } from 'express';
import { z } from 'zod';
import { postsRepo } from '../db/repos/posts.js';
import { likesRepo } from '../db/repos/likes.js';
import { repostsRepo } from '../db/repos/reposts.js';
import { repliesRepo } from '../db/repos/replies.js';
import { notificationsRepo } from '../db/repos/notifications.js';
import { usersRepo } from '../db/repos/users.js';
import { requireAuth } from '../middleware/auth.js';
import { shapePost } from '../helpers.js';

const router = Router();

const createPostSchema = z.object({ content: z.string().min(1).max(280) });
const updatePostSchema = z.object({ content: z.string().min(1).max(280) });
const replySchema = z.object({ content: z.string().min(1).max(280) });

router.post('/', requireAuth, (req, res) => {
  const parsed = createPostSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }
  const post = postsRepo.create({ authorId: req.userId!, content: parsed.data.content });
  res.status(201).json({ post: shapePost(post, req.userId) });
});

router.get('/:postId', (req, res) => {
  const post = postsRepo.findById(req.params.postId);
  if (!post) {
    res.status(404).json({ error: 'Post not found' });
    return;
  }
  const replies = repliesRepo.getByPost(post.id);
  const shapedReplies = replies.map((r) => {
    const author = usersRepo.findById(r.authorId);
    return {
      id: r.id,
      postId: r.postId,
      parentReplyId: r.parentReplyId,
      content: r.deletedAt ? null : r.content,
      deleted: !!r.deletedAt,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      author: author
        ? { id: author.id, username: author.username, displayName: author.displayName, avatarUrl: author.avatarUrl }
        : null,
      canEdit: req.userId === r.authorId,
      canDelete: req.userId === r.authorId,
    };
  });
  res.json({ post: shapePost(post, req.userId), replies: shapedReplies });
});

router.patch('/:postId', requireAuth, (req, res) => {
  const post = postsRepo.findById(req.params.postId);
  if (!post || post.deletedAt) {
    res.status(404).json({ error: 'Post not found' });
    return;
  }
  if (post.authorId !== req.userId) {
    res.status(403).json({ error: 'Not authorized' });
    return;
  }
  const parsed = updatePostSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }
  const updated = postsRepo.update(post.id, parsed.data.content);
  res.json({ post: shapePost(updated!, req.userId) });
});

router.delete('/:postId', requireAuth, (req, res) => {
  const post = postsRepo.findById(req.params.postId);
  if (!post || post.deletedAt) {
    res.status(404).json({ error: 'Post not found' });
    return;
  }
  if (post.authorId !== req.userId) {
    res.status(403).json({ error: 'Not authorized' });
    return;
  }
  postsRepo.softDelete(post.id);
  res.json({ ok: true });
});

router.post('/:postId/like', requireAuth, (req, res) => {
  const post = postsRepo.findById(req.params.postId);
  if (!post || post.deletedAt) {
    res.status(404).json({ error: 'Post not found' });
    return;
  }
  try {
    likesRepo.create(req.userId!, post.id);
    if (post.authorId !== req.userId) {
      notificationsRepo.create({ userId: post.authorId, type: 'LIKE', actorId: req.userId!, postId: post.id, replyId: null });
    }
    res.json({ post: shapePost(post, req.userId) });
  } catch {
    res.status(409).json({ error: 'Already liked' });
  }
});

router.delete('/:postId/like', requireAuth, (req, res) => {
  const post = postsRepo.findById(req.params.postId);
  if (!post) {
    res.status(404).json({ error: 'Post not found' });
    return;
  }
  likesRepo.remove(req.userId!, post.id);
  res.json({ post: shapePost(post, req.userId) });
});

router.post('/:postId/repost', requireAuth, (req, res) => {
  const post = postsRepo.findById(req.params.postId);
  if (!post || post.deletedAt) {
    res.status(404).json({ error: 'Post not found' });
    return;
  }
  try {
    repostsRepo.create(req.userId!, post.id);
    if (post.authorId !== req.userId) {
      notificationsRepo.create({ userId: post.authorId, type: 'REPOST', actorId: req.userId!, postId: post.id, replyId: null });
    }
    res.json({ post: shapePost(post, req.userId) });
  } catch {
    res.status(409).json({ error: 'Already reposted' });
  }
});

router.delete('/:postId/repost', requireAuth, (req, res) => {
  const post = postsRepo.findById(req.params.postId);
  if (!post) {
    res.status(404).json({ error: 'Post not found' });
    return;
  }
  repostsRepo.remove(req.userId!, post.id);
  res.json({ post: shapePost(post, req.userId) });
});

router.post('/:postId/replies', requireAuth, (req, res) => {
  const post = postsRepo.findById(req.params.postId);
  if (!post || post.deletedAt) {
    res.status(404).json({ error: 'Post not found' });
    return;
  }
  const parsed = replySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }
  const reply = repliesRepo.create({ postId: post.id, parentReplyId: null, authorId: req.userId!, content: parsed.data.content });
  if (post.authorId !== req.userId) {
    notificationsRepo.create({ userId: post.authorId, type: 'REPLY', actorId: req.userId!, postId: post.id, replyId: reply.id });
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
      author: author ? { id: author.id, username: author.username, displayName: author.displayName, avatarUrl: author.avatarUrl } : null,
      canEdit: true,
      canDelete: true,
    },
  });
});

export default router;
