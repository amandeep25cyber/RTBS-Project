require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Redis = require('ioredis');
const cookieParser = require('cookie-parser');

const authRoutes     = require('./routes/auth');
const campaignRoutes = require('./routes/campaigns');
const slotRoutes     = require('./routes/slots');
const walletRoutes   = require('./routes/wallet');
const earningsRoutes = require('./routes/earnings');
const adminRoutes    = require('./routes/admin');

const app = express();
const port = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(cookieParser());

// CORS — allow the frontend origin to send cookies
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', CLIENT_ORIGIN);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// ── Database connections ──────────────────────────────────────────────────────

// Redis
const redis = new Redis({
  host: process.env.REDIS_HOST || 'redis',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
});
redis.on('connect', () => console.log('Successfully connected to Redis'));
redis.on('error', (err) => console.error('Redis connection error:', err));

// Make the redis client available to route handlers / services
app.locals.redis = redis;

// MongoDB
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://mongo:27017/rtb')
  .then(() => console.log('Successfully connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// ── Routes ────────────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.status(200).json({ status: 'OK' }));
app.use('/auth',      authRoutes);
app.use('/campaigns', campaignRoutes);
app.use('/slots',     slotRoutes);
app.use('/wallet',    walletRoutes);
app.use('/earnings',  earningsRoutes);
app.use('/admin',     adminRoutes);

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const http = require('http');
const socketService = require('./services/socketService');

const server = http.createServer(app);
socketService.init(server);

server.listen(port, () => console.log(`Server is running on port ${port}`));
