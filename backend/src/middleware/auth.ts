import { Request, Response, NextFunction } from 'express';
import { sessionsRepo } from '../db/repos/index.js';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace -- Express declaration merging
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

const SESSION_COOKIE = 'aceverse_sid';

export function extractUser(req: Request, _res: Response, next: NextFunction): void {
  const sid = req.cookies?.[SESSION_COOKIE];
  if (sid) {
    const session = sessionsRepo.findById(sid);
    if (session) {
      req.userId = session.userId;
    }
  }
  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.userId) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  next();
}

export function setSessionCookie(res: Response, sessionId: string): void {
  res.cookie(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(SESSION_COOKIE, { path: '/' });
}

