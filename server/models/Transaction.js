const mongoose = require('mongoose');

// Money ledger — append-only, NEVER edited
const transactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['deposit', 'campaign_spend', 'publisher_earning', 'platform_fee', 'payout'],
      required: true,
    },
    amount: { type: Number, required: true },      // integer paise
    balanceAfter: { type: Number, required: true }, // integer paise — snapshot after this tx
    // Only for deposits — unique sparse index makes webhook handling idempotent (§8.2)
    gatewayTransactionId: { type: String },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

// Sparse unique index: enforces idempotency without blocking rows that don't have it
transactionSchema.index({ gatewayTransactionId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Transaction', transactionSchema);
