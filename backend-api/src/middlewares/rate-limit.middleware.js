const rateLimit = require('express-rate-limit');
const { sendError } = require('../utils/response');

// ─── Generic Rate Limiter Factory ─────────────────────────────────────────────
const createLimiter = (windowMs, max, message) => {
  const limiter = rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => sendError(res, message, null, 429)
  });

  // Dynamically check environment on each request
  return (req, res, next) => {
    if (process.env.NODE_ENV === 'development') {
      return next();
    }
    return limiter(req, res, next);
  };
};

// ─── Auth Limiters ────────────────────────────────────────────────────────────
const loginLimiter = createLimiter(
  15 * 60 * 1000,
  10,
  'Too many login attempts. Please wait 15 minutes before trying again.'
);

const otpLimiter = createLimiter(
  60 * 60 * 1000,
  5,
  'Too many OTP requests. Please wait an hour before requesting again.'
);

const registerLimiter = createLimiter(
  60 * 60 * 1000,
  3,
  'Too many accounts created from this IP. Please try again later.'
);

// ─── Content Limiters ─────────────────────────────────────────────────────────
const postLimiter = createLimiter(
  60 * 60 * 1000,
  10,
  'Too many submissions. Please wait before submitting more content.'
);

const connectionLimiter = createLimiter(
  60 * 60 * 1000,
  20,
  'Too many connection requests sent. Please slow down.'
);

// ─── Global API Limiter ───────────────────────────────────────────────────────
const globalLimiter = createLimiter(
  15 * 60 * 1000,
  200,
  'Too many requests from this IP. Please try again later.'
);

module.exports = {
  loginLimiter,
  otpLimiter,
  registerLimiter,
  postLimiter,
  connectionLimiter,
  globalLimiter
};
