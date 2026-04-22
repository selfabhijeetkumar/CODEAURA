import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { githubLimiter } from '../middleware/rate-limit.js';
import { importFromGitHub } from '../services/github.service.js';

const router = Router();

const GithubBody = z.object({
  url: z.string().url(),
});

router.post('/github/import', githubLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { url } = GithubBody.parse(req.body);
    const result = await importFromGitHub(url);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
