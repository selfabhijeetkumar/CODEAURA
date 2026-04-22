import { Router } from 'express';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'CODEAURA API',
    version: '1.0.0',
    timestamp: Date.now(),
    uptime: process.uptime(),
  });
});

export default router;
