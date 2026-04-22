import rateLimit from 'express-rate-limit';

export const analyzeLimiter = rateLimit({
  windowMs: 60 * 1000,          // 1 minute
  max: 30,                       // 30 analyze requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMITED', message: 'Too many analyze requests. Please wait a minute.' } },
});

export const askLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMITED', message: 'Too many ask requests. Please wait a minute.' } },
});

export const githubLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMITED', message: 'Too many GitHub import requests.' } },
});
