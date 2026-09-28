const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin', 'advertiser', 'publisher'], required: true },
    status: { type: String, enum: ['active', 'blocked', 'under_review'], default: 'active' },

    // Advertiser-only fields
    companyName: { type: String },
    industry: { type: String },
    walletBalance: { type: Number, default: 0 }, // integer paise, advertiser only

    // Publisher-only fields
    websiteName: { type: String },
    websiteUrl: { type: String },
    earningsBalance: { type: Number, default: 0 }, // integer paise, publisher only
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

module.exports = mongoose.model('User', userSchema);
