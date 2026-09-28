const Slot = require('../models/Slot');

/**
 * List all slots owned by the given publisher.
 * @param {string} publisherId
 */
async function listSlots(publisherId) {
  return Slot.find({ publisherId }).sort({ _id: -1 }).lean();
}

/**
 * Create a new ad slot for the given publisher.
 * floorPrice must be an integer in paise.
 * @param {string} publisherId
 * @param {object} fields
 */
async function createSlot(publisherId, fields) {
  const { slotName, category, floorPrice } = fields;

  if (!slotName || !category) {
    const err = new Error('slotName and category are required');
    err.status = 400;
    throw err;
  }
  if (!Number.isInteger(floorPrice) || floorPrice < 0) {
    const err = new Error('floorPrice must be a non-negative integer in paise');
    err.status = 400;
    throw err;
  }

  const slot = await Slot.create({
    publisherId,
    slotName,
    category,
    floorPrice,
    status: 'active',
  });

  return slot.toObject();
}

/**
 * Update an existing slot. Only the owner may call this (enforced by requireOwnership).
 * @param {string} id
 * @param {object} updates
 */
async function updateSlot(id, updates) {
  const allowed = ['slotName', 'category', 'floorPrice', 'status'];
  const safeUpdates = {};
  for (const key of allowed) {
    if (updates[key] !== undefined) safeUpdates[key] = updates[key];
  }

  if (safeUpdates.floorPrice !== undefined && (!Number.isInteger(safeUpdates.floorPrice) || safeUpdates.floorPrice < 0)) {
    const err = new Error('floorPrice must be a non-negative integer in paise');
    err.status = 400;
    throw err;
  }

  const slot = await Slot.findByIdAndUpdate(
    id,
    { $set: safeUpdates },
    { new: true, runValidators: true }
  ).lean();

  if (!slot) {
    const err = new Error('Slot not found');
    err.status = 404;
    throw err;
  }

  return slot;
}

module.exports = { listSlots, createSlot, updateSlot };
