const mongoose = require('mongoose');

// Write-heavy raw history — dashboards never query this directly
const auctionLogSchema = new mongoose.Schema(
  {
    slotId: { type: mongoose.Schema.Types.ObjectId, ref: 'Slot', required: true },
    winningCampaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', default: null },
    winningBid: { type: Number, default: null }, // integer paise, null if no-bid
    latencyMs: { type: Number, required: true },
    timestamp: { type: Date, required: true, default: Date.now, index: true },
  },
  { _id: true }
);

module.exports = mongoose.model('AuctionLog', auctionLogSchema);
