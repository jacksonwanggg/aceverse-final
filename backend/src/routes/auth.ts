import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { usersRepo } from '../db/repos/users.js';
import { sessionsRepo } from '../db/repos/sessions.js';
import { requireAuth, setSessionCookie, clearSessionCookie } from '../middleware/auth.js';
import { shapeUser } from '../helpers.js';

const router = Router();

const registerSchema = z.object({
  username: z.string().min(2).max(30).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  displayName: z.string().min(1).max(50).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

router.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }
  const { username, email, password, displayName } = parsed.data;

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = usersRepo.create({
      username,
      email,
      passwordHash,
      displayName: displayName || username,
      bio: '',
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${username}`,
    });
    const session = sessionsRepo.create(user.id);
    setSessionCookie(res, session.id);
    res.status(201).json({ user: shapeUser(user, user.id) });
  } catch (err: unknown) {
    res.status(409).json({ error: err instanceof Error ? err.message : 'Conflict' });
  }
});

router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }
  const { email, password } = parsed.data;

  const user = usersRepo.findByEmail(email);
  if (!user) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const session = sessionsRepo.create(user.id);
  setSessionCookie(res, session.id);
  res.json({ user: shapeUser(user, user.id) });
});

router.post('/logout', requireAuth, (req, res) => {
  const sid = req.cookies?.aceverse_sid;
  if (sid) sessionsRepo.remove(sid);
  clearSessionCookie(res);
  res.json({ ok: true });
});

router.get('/me', (req, res) => {
  if (!req.userId) {
    res.json({ user: null });
    return;
  }
  const user = usersRepo.findById(req.userId);
  if (!user) {
    res.json({ user: null });
    return;
  }
  res.json({ user: shapeUser(user, user.id) });
});

export default router;
