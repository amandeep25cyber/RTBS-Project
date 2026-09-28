const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema(
  {
    advertiserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    dailyBudget: { type: Number, required: true }, // integer paise
    maxBid: { type: Number, required: true },       // integer paise
    targeting: {
      geo: { type: [String], default: [] },
      device: { type: [String], default: [] },
      category: { type: [String], default: [] },   // category IDs, broad or leaf
    },
    frequencyCapPerDay: { type: Number, required: true, default: 5 },
    status: { type: String, enum: ['active', 'paused'], default: 'active' },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

// spentToday is NOT stored here — it lives in Redis
module.exports = mongoose.model('Campaign', campaignSchema);
