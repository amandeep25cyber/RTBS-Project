const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for /auth/login — 10 attempts per IP per 15 minutes.
 * Returns a consistent JSON error (not HTML) when the limit is hit.
 */
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again after 15 minutes.' },
});

/**
 * Rate limiter for auction-related endpoints — tighter limit to prevent auction spam.
 * 60 requests per minute per IP.
 */
const auctionRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Auction request rate limit exceeded. Slow down.' },
});

module.exports = { loginRateLimiter, auctionRateLimiter };
