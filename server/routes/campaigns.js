const express = require('express');
const router = express.Router();

const { authMiddleware, requireRole, requireOwnership } = require('../middleware/auth');
const Campaign = require('../models/Campaign');
const {
  listCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
} = require('../services/campaignService');

// All campaign routes require an authenticated advertiser
router.use(authMiddleware);
router.use(requireRole('advertiser'));

/**
 * GET /campaigns
 * List the logged-in advertiser's campaigns.
 */
router.get('/', async (req, res, next) => {
  try {
    const campaigns = await listCampaigns(req.user.id);
    return res.status(200).json(campaigns);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /campaigns/:id
 * Get a single campaign (ownership enforced).
 */
router.get('/:id', requireOwnership(Campaign, 'id', 'advertiserId'), async (req, res) => {
  // req.resource is attached by requireOwnership
  return res.status(200).json(req.resource.toObject ? req.resource.toObject() : req.resource);
});

/**
 * POST /campaigns
 * Create a new campaign for the logged-in advertiser.
 * Money fields (dailyBudget, maxBid) must be integers in paise.
 */
router.post('/', async (req, res, next) => {
  try {
    const { name, dailyBudget, maxBid, targeting, frequencyCapPerDay } = req.body;
    if (!name || dailyBudget === undefined || maxBid === undefined) {
      return res.status(400).json({ error: 'name, dailyBudget, and maxBid are required' });
    }
    const campaign = await createCampaign(req.user.id, req.body);
    return res.status(201).json(campaign);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
});

/**
 * PUT /campaigns/:id
 * Update a campaign (ownership enforced). Enqueues targetingIndexJob.
 */
router.put('/:id', requireOwnership(Campaign, 'id', 'advertiserId'), async (req, res, next) => {
  try {
    const campaign = await updateCampaign(req.params.id, req.body);
    return res.status(200).json(campaign);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
});

module.exports = router;
