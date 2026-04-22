import { Router } from 'express';
import { getHealthReport } from '../services/api-key-manager.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'CODEAURA API',
    version: '1.0.0',
    timestamp: Date.now(),
    uptime: process.uptime(),
    aiPool: getHealthReport(),
  });
});

export default router;
