require('dotenv').config();
const mongoose = require('mongoose');
const Redis = require('ioredis');

// Redis Connection
const redis = new Redis({
  host: process.env.REDIS_HOST || 'redis',
  port: process.env.REDIS_PORT || 6379,
});

redis.on('connect', () => {
  console.log('Worker: Successfully connected to Redis');
});

redis.on('error', (err) => {
  console.error('Worker: Redis connection error:', err);
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://mongo:27017/rtb')
  .then(() => {
    console.log('Worker: Successfully connected to MongoDB');
  })
  .catch((err) => {
    console.error('Worker: MongoDB connection error:', err);
  });

console.log('Worker is running and waiting for jobs...');
