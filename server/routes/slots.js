const express = require('express');
const router = express.Router();

const { authMiddleware, requireRole, requireOwnership } = require('../middleware/auth');
const Slot = require('../models/Slot');
const { listSlots, createSlot, updateSlot } = require('../services/slotService');

// All slot routes require an authenticated publisher
router.use(authMiddleware);
router.use(requireRole('publisher'));

/**
 * GET /slots
 * List the logged-in publisher's slots.
 */
router.get('/', async (req, res, next) => {
  try {
    const slots = await listSlots(req.user.id);
    return res.status(200).json(slots);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /slots/:id
 * Get a single slot (ownership enforced).
 */
router.get('/:id', requireOwnership(Slot, 'id', 'publisherId'), async (req, res) => {
  return res.status(200).json(req.resource.toObject ? req.resource.toObject() : req.resource);
});

/**
 * POST /slots
 * Create a new slot for the logged-in publisher.
 * floorPrice must be a non-negative integer in paise.
 */
router.post('/', async (req, res, next) => {
  try {
    const { slotName, category, floorPrice } = req.body;
    if (!slotName || !category || floorPrice === undefined) {
      return res.status(400).json({ error: 'slotName, category, and floorPrice are required' });
    }
    const slot = await createSlot(req.user.id, req.body);
    return res.status(201).json(slot);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
});

/**
 * PUT /slots/:id
 * Update a slot (ownership enforced).
 */
router.put('/:id', requireOwnership(Slot, 'id', 'publisherId'), async (req, res, next) => {
  try {
    const slot = await updateSlot(req.params.id, req.body);
    return res.status(200).json(slot);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
});

module.exports = router;
