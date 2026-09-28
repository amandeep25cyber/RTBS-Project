/**
 * budgetResetJob.js
 *
 * BullMQ worker processor for the 'budgetReset' queue.
 *
 * Runs nightly at 00:00 (scheduled by a cron in worker.js).
 * Resets every active campaign's Redis budget key:
 *
 *   budget:{campaignId}  →  campaign.dailyBudget  (integer paise)
 *
 * This makes the full daily budget available again for the next day's auctions.
 * The key is recreated with SET (no TTL — it persists until the next reset).
 *
 * Per server.md §4 and §9.
 */
const Campaign = require('../models/Campaign');
const Redis = require('ioredis');

function makeRedis() {
  return new Redis({
    host: process.env.REDIS_HOST || 'redis',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    maxRetriesPerRequest: null,
  });
}

/**
 * Main processor — called by BullMQ for each job.
 * @param {import('bullmq').Job} job
 */
async function processBudgetReset(job) {
  const redis = makeRedis();

  try {
    // Load all active campaigns
    const campaigns = await Campaign.find({ status: 'active' }).select('_id dailyBudget').lean();

    if (campaigns.length === 0) {
      console.log('budgetResetJob: no active campaigns to reset');
      return;
    }

    // Reset budget keys in a pipeline for efficiency
    const pipeline = redis.pipeline();
    for (const campaign of campaigns) {
      const key = `budget:${campaign._id.toString()}`;
      pipeline.set(key, campaign.dailyBudget);
    }
    await pipeline.exec();

    console.log(`budgetResetJob: reset ${campaigns.length} campaign budget(s)`);
  } finally {
    await redis.quit();
  }
}

module.exports = { processBudgetReset };
