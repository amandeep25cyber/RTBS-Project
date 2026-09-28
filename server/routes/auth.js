const express = require('express');
const router = express.Router();

const authService = require('../services/authService');
const { authMiddleware } = require('../middleware/auth');
const { loginRateLimiter } = require('../middleware/rateLimiter');

const COOKIE_NAME = process.env.COOKIE_NAME || 'rtb_token';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // only enforce HTTPS in prod
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

/**
 * POST /auth/signup
 * Advertiser/Publisher only. Admin signup is explicitly rejected.
 */
router.post('/signup', async (req, res, next) => {
  try {
    const { name, email, password, role, companyName, industry, websiteName, websiteUrl } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'name, email, password, and role are required' });
    }

    const user = await authService.signup({
      name,
      email,
      password,
      role,
      companyName,
      industry,
      websiteName,
      websiteUrl,
    });

    // Log the new user in immediately — same flow as /login
    const { token } = await authService.login({ email, password });
    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);

    return res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
});

/**
 * POST /auth/login
 * Rate-limited. Sets httpOnly cookie on success.
 */
router.post('/login', loginRateLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const { token, user } = await authService.login({ email, password });
    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);

    return res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
});

/**
 * POST /auth/logout
 * Clears the auth cookie.
 */
router.post('/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME);
  return res.status(200).json({ message: 'Logged out successfully' });
});

/**
 * GET /auth/me
 * Returns the current user's profile (useful for the frontend to restore session).
 */
router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.status(200).json(user);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
