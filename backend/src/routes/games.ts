import { Router } from 'express';
import { gamesRepo } from '../db/repos/games.js';

const router = Router();

router.get('/', (_req, res) => {
  const games = gamesRepo.getAll();
  res.json({ games });
});

export default router;
