/**
 * targetingIndexJob.js
 *
 * BullMQ worker processor for the 'targetingIndex' queue.
 *
 * When a campaign is created, updated, or paused this job rebuilds that
 * campaign's entries in the Redis targeting sets:
 *
 *   targeting:{geo}:{device}:{categoryId}  →  Set of campaignIds
 *
 * The AuctionService reads these sets for O(1) candidate lookup instead of
 * scanning every campaign in MongoDB (server.md §7 step 1).
 *
 * Strategy:
 *  1. Scan all existing targeting:* keys that contain this campaignId and
 *     remove it (handles the case where geo/device/category changed).
 *  2. If the campaign is active, add it to all current targeting key combos.
 *
 * All Redis key names come from the pattern in server.md §4.
 */
const Campaign = require('../models/Campaign');
const Category = require('../models/Category');
const Redis = require('ioredis');

function makeRedis() {
  return new Redis({
    host: process.env.REDIS_HOST || 'redis',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    maxRetriesPerRequest: null, // required by BullMQ
  });
}

/**
 * Returns the list of targeting Redis keys that a campaign should appear in,
 * given its current geo/device/category arrays and the full category map.
 *
 * @param {object}   campaign      - Mongoose campaign document
 * @param {Map}      categoryMap   - Map<categoryId, { parentId }>
 * @returns {string[]}
 */
function buildTargetingKeys(campaign, categoryMap) {
  const { targeting } = campaign;
  const geos     = targeting.geo.length     ? targeting.geo     : ['*'];
  const devices  = targeting.device.length  ? targeting.device  : ['*'];
  const catIds   = targeting.category;

  // Expand category IDs: each catId also covers its children (slots use leaf cats)
  // But per spec, the key uses the slot's category. We index the campaign under
  // every category that COULD match — i.e. every leaf category whose id or parentId
  // is in campaign.targeting.category.
  const expandedCats = new Set();
  for (const [id, cat] of categoryMap) {
    for (const targetedCatId of catIds) {
      if (id === targetedCatId || cat.parentId === targetedCatId) {
        expandedCats.add(id);
      }
    }
  }

  // If no categories specified, use a wildcard
  const finalCats = expandedCats.size > 0 ? [...expandedCats] : ['*'];

  const keys = [];
  for (const geo of geos) {
    for (const device of devices) {
      for (const cat of finalCats) {
        keys.push(`targeting:${geo}:${device}:${cat}`);
      }
    }
  }
  return keys;
}

/**
 * Remove this campaign from ALL targeting:* sets it currently belongs to.
 * Uses Redis SCAN to find relevant keys.
 */
async function removeFromAllTargetingKeys(redis, campaignId) {
  const pattern = 'targeting:*';
  let cursor = '0';
  do {
    const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
    cursor = nextCursor;
    if (keys.length > 0) {
      const pipeline = redis.pipeline();
      for (const key of keys) {
        pipeline.srem(key, campaignId);
      }
      await pipeline.exec();
    }
  } while (cursor !== '0');
}

/**
 * Main processor — called by BullMQ for each job.
 * @param {import('bullmq').Job} job
 */
async function processTargetingIndex(job) {
  const { campaignId } = job.data;
  const redis = makeRedis();

  try {
    // Load campaign and category map
    const campaign = await Campaign.findById(campaignId).lean();
    if (!campaign) {
      console.warn(`targetingIndexJob: campaign ${campaignId} not found — skipping`);
      return;
    }

    const categories = await Category.find({}).lean();
    const categoryMap = new Map(categories.map((c) => [c._id.toString(), c]));

    // Step 1: Remove campaign from all existing targeting sets
    await removeFromAllTargetingKeys(redis, campaignId);

    // Step 2: Add campaign to current targeting sets only if active
    if (campaign.status === 'active') {
      const keys = buildTargetingKeys(campaign, categoryMap);
      if (keys.length > 0) {
        const pipeline = redis.pipeline();
        for (const key of keys) {
          pipeline.sadd(key, campaignId);
        }
        await pipeline.exec();
        console.log(`targetingIndexJob: campaign ${campaignId} indexed in ${keys.length} key(s)`);
      }
    } else {
      console.log(`targetingIndexJob: campaign ${campaignId} is ${campaign.status} — removed from all targeting keys`);
    }
  } finally {
    await redis.quit();
  }
}

module.exports = { processTargetingIndex, buildTargetingKeys };
