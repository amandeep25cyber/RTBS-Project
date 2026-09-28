const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const SALT_ROUNDS = 12;

/**
 * Sign up a new advertiser or publisher.
 * Admin signup is explicitly rejected — admins are seeded only.
 */
async function signup({ name, email, password, role, ...roleFields }) {
  if (role === 'admin') {
    const err = new Error('Admin accounts cannot be created via signup');
    err.status = 403;
    throw err;
  }
  if (!['advertiser', 'publisher'].includes(role)) {
    const err = new Error('Role must be advertiser or publisher');
    err.status = 400;
    throw err;
  }

  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    const err = new Error('Email already registered');
    err.status = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const userData = { name, email, password: undefined, passwordHash, role, status: 'active' };

  // Role-specific fields
  if (role === 'advertiser') {
    if (roleFields.companyName) userData.companyName = roleFields.companyName;
    if (roleFields.industry) userData.industry = roleFields.industry;
    userData.walletBalance = 0;
  }
  if (role === 'publisher') {
    if (roleFields.websiteName) userData.websiteName = roleFields.websiteName;
    if (roleFields.websiteUrl) userData.websiteUrl = roleFields.websiteUrl;
    userData.earningsBalance = 0;
  }

  const user = await User.create(userData);
  return user;
}

/**
 * Verify credentials and return a signed JWT payload.
 * The cookie is set by the route handler.
 */
async function login({ email, password }) {
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }
  if (user.status === 'blocked') {
    const err = new Error('Account is blocked');
    err.status = 403;
    throw err;
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }

  const token = jwt.sign(
    { userId: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return { token, user };
}

module.exports = { signup, login };
