require('dotenv').config();
const mongoose = require('mongoose');
const { Worker, QueueScheduler, Queue } = require('bullmq');

const { processTargetingIndex } = require('./jobs/targetingIndexJob');
const { processBudgetReset }    = require('./jobs/budgetResetJob');

const redisConnection = {
  host: process.env.REDIS_HOST || 'redis',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  maxRetriesPerRequest: null,
};

// ── MongoDB connection ─────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://mongo:27017/rtb')
  .then(() => console.log('Worker: Successfully connected to MongoDB'))
  .catch((err) => console.error('Worker: MongoDB connection error:', err));

// ── BullMQ Workers ─────────────────────────────────────────────────────────────
const targetingIndexWorker = new Worker(
  'targetingIndex',
  processTargetingIndex,
  { connection: redisConnection, concurrency: 5 }
);

const budgetResetWorker = new Worker(
  'budgetReset',
  processBudgetReset,
  { connection: redisConnection, concurrency: 1 }
);

targetingIndexWorker.on('completed', (job) =>
  console.log(`targetingIndexJob ${job.id} completed`)
);
targetingIndexWorker.on('failed', (job, err) =>
  console.error(`targetingIndexJob ${job?.id} failed:`, err.message)
);

budgetResetWorker.on('completed', (job) =>
  console.log(`budgetResetJob ${job.id} completed`)
);
budgetResetWorker.on('failed', (job, err) =>
  console.error(`budgetResetJob ${job?.id} failed:`, err.message)
);

// ── Scheduled cron: budget reset at midnight every day ────────────────────────
const budgetResetQueue = new Queue('budgetReset', { connection: redisConnection });

budgetResetQueue.add(
  'resetAllBudgets',
  {},
  {
    repeat: { cron: '0 0 * * *' }, // nightly at 00:00
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
  }
).catch((err) => console.error('Worker: failed to schedule budgetResetJob:', err));

const { processHourlyRollup } = require('./jobs/hourlyRollupJob');
const hourlyRollupWorker = new Worker(
  'hourlyRollup',
  processHourlyRollup,
  { connection: redisConnection, concurrency: 1 }
);
hourlyRollupWorker.on('completed', (job) => console.log(`hourlyRollupJob ${job.id} completed`));
hourlyRollupWorker.on('failed', (job, err) => console.error(`hourlyRollupJob ${job?.id} failed:`, err.message));

const hourlyRollupQueue = new Queue('hourlyRollup', { connection: redisConnection });
hourlyRollupQueue.add(
  'rollupLogs',
  {},
  {
    repeat: { cron: '0 * * * *' }, // top of every hour
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
  }
).catch((err) => console.error('Worker: failed to schedule hourlyRollupJob:', err));

console.log('Worker is running and waiting for jobs...');
