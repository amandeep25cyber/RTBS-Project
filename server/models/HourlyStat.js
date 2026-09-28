const mongoose = require('mongoose');

// Precomputed rollups — one doc per entity per hour
const hourlyStatsSchema = new mongoose.Schema(
  {
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', default: null },
    slotId: { type: mongoose.Schema.Types.ObjectId, ref: 'Slot', default: null },
    hour: { type: Date, required: true }, // truncated to the hour
    spend: { type: Number, default: 0 },   // integer paise
    revenue: { type: Number, default: 0 }, // integer paise
    wins: { type: Number, default: 0 },
    avgLatencyMs: { type: Number, default: 0 },
    p95LatencyMs: { type: Number, default: 0 },
  },
  { _id: true }
);

// Compound index for efficient rollup queries
hourlyStatsSchema.index({ campaignId: 1, hour: 1 });
hourlyStatsSchema.index({ slotId: 1, hour: 1 });

module.exports = mongoose.model('HourlyStat', hourlyStatsSchema);
