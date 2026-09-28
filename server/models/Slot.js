const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema(
  {
    publisherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    slotName: { type: String, required: true },
    category: { type: String, required: true }, // single leaf category ID
    floorPrice: { type: Number, required: true, default: 0 }, // integer paise
    status: { type: String, enum: ['active', 'paused'], default: 'active' },
  },
  { timestamps: false }
);

module.exports = mongoose.model('Slot', slotSchema);
