const Campaign = require('../models/Campaign');
const { enqueueTargetingIndex } = require('./queueService');

/**
 * List all campaigns owned by the given advertiser.
 * @param {string} advertiserId
 */
async function listCampaigns(advertiserId) {
  return Campaign.find({ advertiserId }).sort({ createdAt: -1 }).lean();
}

/**
 * Get a single campaign by id (ownership is enforced by requireOwnership middleware).
 * @param {string} id
 */
async function getCampaign(id) {
  return Campaign.findById(id).lean();
}

/**
 * Create a new campaign for the given advertiser.
 * All money fields (dailyBudget, maxBid) must arrive in paise (integers).
 * @param {string} advertiserId
 * @param {object} fields
 */
async function createCampaign(advertiserId, fields) {
  const { name, dailyBudget, maxBid, targeting, frequencyCapPerDay } = fields;

  // Guard: money must be integers in paise
  if (!Number.isInteger(dailyBudget) || dailyBudget <= 0) {
    const err = new Error('dailyBudget must be a positive integer in paise');
    err.status = 400;
    throw err;
  }
  if (!Number.isInteger(maxBid) || maxBid <= 0) {
    const err = new Error('maxBid must be a positive integer in paise');
    err.status = 400;
    throw err;
  }

  const campaign = await Campaign.create({
    advertiserId,
    name,
    dailyBudget,
    maxBid,
    targeting: targeting || { geo: [], device: [], category: [] },
    frequencyCapPerDay: frequencyCapPerDay || 5,
    status: 'active',
  });

  // Enqueue targeting index rebuild (async — does not block the response)
  await enqueueTargetingIndex(campaign._id.toString());

  return campaign.toObject();
}

/**
 * Update a campaign. Only the owner may call this (enforced by requireOwnership).
 * Enqueues targetingIndexJob whenever targeting/status/budget changes.
 * @param {string} id
 * @param {object} updates
 */
async function updateCampaign(id, updates) {
  const allowed = ['name', 'dailyBudget', 'maxBid', 'targeting', 'frequencyCapPerDay', 'status'];
  const safeUpdates = {};
  for (const key of allowed) {
    if (updates[key] !== undefined) safeUpdates[key] = updates[key];
  }

  // Guard money fields if provided
  if (safeUpdates.dailyBudget !== undefined && (!Number.isInteger(safeUpdates.dailyBudget) || safeUpdates.dailyBudget <= 0)) {
    const err = new Error('dailyBudget must be a positive integer in paise');
    err.status = 400;
    throw err;
  }
  if (safeUpdates.maxBid !== undefined && (!Number.isInteger(safeUpdates.maxBid) || safeUpdates.maxBid <= 0)) {
    const err = new Error('maxBid must be a positive integer in paise');
    err.status = 400;
    throw err;
  }

  const campaign = await Campaign.findByIdAndUpdate(
    id,
    { $set: safeUpdates },
    { new: true, runValidators: true }
  ).lean();

  if (!campaign) {
    const err = new Error('Campaign not found');
    err.status = 404;
    throw err;
  }

  // Re-index whenever any field that affects auction eligibility changes
  await enqueueTargetingIndex(id);

  return campaign;
}

module.exports = { listCampaigns, getCampaign, createCampaign, updateCampaign };
