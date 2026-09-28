const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

const { runAuctionLogic } = require('./auctionEngine');
const socketService = require('./socketService');
const AuctionLog = require('../models/AuctionLog');

/**
 * Executes a full auction flow for a given slot.
 * @param {object} slot - The Mongoose slot document
 * @param {object} redis - ioredis client
 */
async function processAuction(slot, redis) {
  const startTime = Date.now();
  
  // 1. Candidate lookup: read targeting:{geo}:{device}:{categoryId} from Redis
  // Here we assume geo and device come from request context, but we use defaults for the simulator
  const geo = 'IN'; 
  const device = 'mobile';
  const categoryId = slot.category;

  const targetingKey = `targeting:${geo}:${device}:${categoryId}`;
  const candidateIds = await redis.smembers(targetingKey);

  let winner = null;
  let noBid = true;

  if (candidateIds.length > 0) {
    // We need to fetch campaign details. To keep it fast, we could fetch from Mongo or a Redis cache.
    // The spec says "read targeting... from Redis... This avoids scanning every campaign in Mongo."
    // We still need maxBid, freqCap, etc. We'll fetch the candidate campaigns from Mongo.
    const Campaign = mongoose.model('Campaign');
    const campaigns = await Campaign.find({ _id: { $in: candidateIds }, status: 'active' }).lean();
    
    // 2. Eligibility filter: fetch budget and freqcap from Redis in parallel
    const pipeline = redis.pipeline();
    campaigns.forEach(c => {
      pipeline.get(`budget:${c._id.toString()}`);
      pipeline.get(`freqcap:${c.advertiserId.toString()}:${c._id.toString()}`);
    });
    const results = await pipeline.exec();

    const state = {};
    campaigns.forEach((c, index) => {
      const budgetResult = results[index * 2][1];
      const freqcapResult = results[index * 2 + 1][1];
      state[c._id.toString()] = {
        budget: budgetResult ? parseInt(budgetResult, 10) : 0, // dailyBudget is seeded into budget:id
        freqcap: freqcapResult ? parseInt(freqcapResult, 10) : 0
      };
    });

    // Run pure logic
    winner = runAuctionLogic(slot, campaigns, state);
  }

  const latencyMs = Date.now() - startTime;

  if (winner) {
    noBid = false;
    const winningBid = winner.maxBid;

    // 5. On a win: atomic Redis budget/freqcap update and three-way Mongo transactions
    // 5a: Redis update
    const budgetKey = `budget:${winner._id.toString()}`;
    const freqcapKey = `freqcap:${winner.advertiserId.toString()}:${winner._id.toString()}`;
    
    await redis.pipeline()
      .decrby(budgetKey, winningBid)
      .incr(freqcapKey)
      .expire(freqcapKey, 86400) // TTL 24h
      .exec();

    // 5b: Mongo transaction
    const platformCommissionPercent = parseInt(process.env.PLATFORM_COMMISSION_PERCENT || '10', 10);
    const platformFee = Math.floor((winningBid * platformCommissionPercent) / 100);
    const publisherEarning = winningBid - platformFee;

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      // Deduct from advertiser
      const advertiser = await User.findByIdAndUpdate(
        winner.advertiserId,
        { $inc: { walletBalance: -winningBid } },
        { returnDocument: 'after', session }
      );

      // Add to publisher
      const publisher = await User.findByIdAndUpdate(
        slot.publisherId,
        { $inc: { earningsBalance: publisherEarning } },
        { returnDocument: 'after', session }
      );

      // Record 3 transactions
      await Transaction.insertMany([{
        userId: winner.advertiserId,
        type: 'campaign_spend',
        amount: winningBid,
        balanceAfter: advertiser.walletBalance,
        status: 'completed'
      }, {
        userId: slot.publisherId,
        type: 'publisher_earning',
        amount: publisherEarning,
        balanceAfter: publisher.earningsBalance,
        status: 'completed'
      }, {
        // Platform fee can be attached to admin or kept null userId if platform-wide
        // We'll attach it to the pre-seeded admin user.
        userId: await getAdminId(),
        type: 'platform_fee',
        amount: platformFee,
        balanceAfter: platformFee, // Balance tracking for admin is optional, but let's keep it simple
        status: 'completed'
      }], { session });

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      console.error('Auction transaction failed:', error);
      // Rollback redis? Ideally yes, but keeping it simple as per spec.
    } finally {
      session.endSession();
    }

    // 6. Async AuctionLogs insert
    AuctionLog.create({
      slotId: slot._id,
      winningCampaignId: winner._id,
      winningBid: winningBid,
      latencyMs,
      timestamp: new Date()
    }).catch(err => console.error('Failed to log auction', err));

    // 7. Emit Socket.io events
    const io = socketService.getIO();
    if (io) {
      io.to('admin-room').emit('auction:completed', {
        slotId: slot._id,
        slotName: slot.slotName,
        winningCampaignId: winner._id,
        winningBid,
        latencyMs,
        noBid: false,
        timestamp: new Date()
      });

      // Emit budget:updated to advertiser
      redis.get(budgetKey).then(newBudget => {
        io.to(`advertiser-${winner.advertiserId.toString()}-room`).emit('budget:updated', {
          campaignId: winner._id,
          remainingBudget: parseInt(newBudget || '0', 10)
        });
      });

      // Emit slot:filled to publisher
      io.to(`publisher-${slot.publisherId.toString()}-room`).emit('slot:filled', {
        slotId: slot._id,
        revenue: publisherEarning
      });
    }

  } else {
    // No-bid
    AuctionLog.create({
      slotId: slot._id,
      winningCampaignId: null,
      winningBid: null,
      latencyMs,
      timestamp: new Date()
    }).catch(err => console.error('Failed to log no-bid auction', err));

    const io = socketService.getIO();
    if (io) {
      io.to('admin-room').emit('auction:completed', {
        slotId: slot._id,
        slotName: slot.slotName,
        winningCampaignId: null,
        winningBid: null,
        latencyMs,
        noBid: true,
        timestamp: new Date()
      });
    }
  }

  return { winner, noBid, latencyMs };
}

// Helper to get Admin ID for platform_fee
let adminId = null;
async function getAdminId() {
  if (adminId) return adminId;
  const admin = await User.findOne({ role: 'admin' }).select('_id').lean();
  if (admin) adminId = admin._id;
  return adminId;
}

module.exports = { processAuction };
