import rateLimit from 'express-rate-limit';

export const generateFormLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
  max: parseInt(process.env.RATE_LIMIT_MAX || '60', 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many form generation requests. Please try again later.'
  },
  keyGenerator: (req: any) => {
    // Prefer userId, fall back to IP
    return req.userId || req.ip;
  }
});

export const uploadLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
  max: parseInt(process.env.RATE_LIMIT_MAX || '60', 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many upload requests. Please try again later.'
  }
});
