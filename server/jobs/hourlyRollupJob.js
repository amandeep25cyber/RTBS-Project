/**
 * hourlyRollupJob.js
 * 
 * BullMQ worker processor for the 'hourlyRollup' queue.
 * Runs at the top of every hour to aggregate the past hour's AuctionLogs 
 * into HourlyStats.
 */
const mongoose = require('mongoose');
const AuctionLog = require('../models/AuctionLog');
const HourlyStat = require('../models/HourlyStat');

async function processHourlyRollup(job) {
  // If a specific hour is provided, use it; otherwise use the previous hour.
  const targetTime = job.data.targetTime ? new Date(job.data.targetTime) : new Date();
  
  // Truncate to the start of the previous hour
  const startHour = new Date(targetTime);
  startHour.setHours(startHour.getHours() - 1, 0, 0, 0);
  
  const endHour = new Date(startHour);
  endHour.setHours(startHour.getHours() + 1, 0, 0, 0);

  console.log(`hourlyRollupJob: Rolling up logs from ${startHour.toISOString()} to ${endHour.toISOString()}`);

  // 1. Rollup for Campaigns
  const campaignAgg = await AuctionLog.aggregate([
    { $match: { timestamp: { $gte: startHour, $lt: endHour }, winningCampaignId: { $ne: null } } },
    { $group: {
        _id: "$winningCampaignId",
        spend: { $sum: "$winningBid" },
        wins: { $sum: 1 },
        avgLatencyMs: { $avg: "$latencyMs" },
        latencies: { $push: "$latencyMs" } // for p95
      }
    }
  ]);

  const campaignStats = campaignAgg.map(stat => {
    stat.latencies.sort((a, b) => a - b);
    const p95Index = Math.floor(stat.latencies.length * 0.95);
    const p95LatencyMs = stat.latencies[p95Index] || 0;
    
    return {
      campaignId: stat._id,
      hour: startHour,
      spend: stat.spend,
      wins: stat.wins,
      avgLatencyMs: Math.round(stat.avgLatencyMs),
      p95LatencyMs
    };
  });

  // 2. Rollup for Slots
  // Publishers earn revenue which is spend minus commission
  const platformCommissionPercent = parseInt(process.env.PLATFORM_COMMISSION_PERCENT || '10', 10);
  const slotAgg = await AuctionLog.aggregate([
    { $match: { timestamp: { $gte: startHour, $lt: endHour }, winningCampaignId: { $ne: null } } },
    { $group: {
        _id: "$slotId",
        grossRevenue: { $sum: "$winningBid" },
        wins: { $sum: 1 },
        avgLatencyMs: { $avg: "$latencyMs" },
        latencies: { $push: "$latencyMs" }
      }
    }
  ]);

  const slotStats = slotAgg.map(stat => {
    stat.latencies.sort((a, b) => a - b);
    const p95Index = Math.floor(stat.latencies.length * 0.95);
    const p95LatencyMs = stat.latencies[p95Index] || 0;
    
    // Revenue is gross - commission
    const platformFee = Math.floor((stat.grossRevenue * platformCommissionPercent) / 100);
    const revenue = stat.grossRevenue - platformFee;

    return {
      slotId: stat._id,
      hour: startHour,
      revenue,
      wins: stat.wins,
      avgLatencyMs: Math.round(stat.avgLatencyMs),
      p95LatencyMs
    };
  });

  // 3. Bulk insert/upsert
  const operations = [];

  for (const stat of campaignStats) {
    operations.push({
      updateOne: {
        filter: { campaignId: stat.campaignId, hour: stat.hour },
        update: { $set: stat },
        upsert: true
      }
    });
  }

  for (const stat of slotStats) {
    operations.push({
      updateOne: {
        filter: { slotId: stat.slotId, hour: stat.hour },
        update: { $set: stat },
        upsert: true
      }
    });
  }

  if (operations.length > 0) {
    await HourlyStat.bulkWrite(operations);
  }

  console.log(`hourlyRollupJob: Rolled up ${campaignStats.length} campaigns and ${slotStats.length} slots`);
}

module.exports = { processHourlyRollup };
