const { Queue } = require('bullmq');

// BullMQ uses its own ioredis connection (separate from the app's redis client)
const redisConnection = {
  host: process.env.REDIS_HOST || 'redis',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
};

// One queue per job type
const targetingIndexQueue = new Queue('targetingIndex', { connection: redisConnection });
const budgetResetQueue    = new Queue('budgetReset',    { connection: redisConnection });

/**
 * Enqueue a targeting index rebuild for a single campaign.
 * Called whenever a campaign is created, updated, or paused.
 * @param {string} campaignId
 */
async function enqueueTargetingIndex(campaignId) {
  await targetingIndexQueue.add(
    'rebuildTargetingIndex',
    { campaignId },
    {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: 100,
      removeOnFail: 50,
    }
  );
}

/**
 * Enqueue a budget reset for all active campaigns.
 * Called by the nightly cron in worker.js.
 */
async function enqueueBudgetReset() {
  await budgetResetQueue.add(
    'resetAllBudgets',
    {},
    {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
    }
  );
}

module.exports = {
  targetingIndexQueue,
  budgetResetQueue,
  enqueueTargetingIndex,
  enqueueBudgetReset,
  redisConnection,
};
