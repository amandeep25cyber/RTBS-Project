const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const HourlyStat = require('../models/HourlyStat');

/**
 * GET /analytics/platform
 * Admin only. Returns platform-wide stats.
 */
router.get('/platform', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

  try {
    // Basic implementation: fetch all HourlyStats for the last 24 hours
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const stats = await HourlyStat.find({ hour: { $gte: yesterday } }).sort({ hour: 1 }).lean();
    
    // Group by hour
    const grouped = {};
    for (const s of stats) {
      const h = new Date(s.hour).toISOString();
      if (!grouped[h]) grouped[h] = { time: h, spend: 0, revenue: 0, wins: 0, avgLatency: 0, p95Latency: 0, count: 0 };
      grouped[h].spend += s.spend || 0;
      grouped[h].revenue += s.revenue || 0;
      grouped[h].wins += s.wins || 0;
      grouped[h].avgLatency += (s.avgLatencyMs || 0);
      grouped[h].p95Latency += (s.p95LatencyMs || 0);
      grouped[h].count++;
    }

    const result = Object.values(grouped).map(g => ({
      time: g.time,
      spend: g.spend,
      revenue: g.revenue,
      wins: g.wins,
      avgLatencyMs: g.count ? Math.round(g.avgLatency / g.count) : 0,
      p95LatencyMs: g.count ? Math.round(g.p95Latency / g.count) : 0
    }));

    res.json(result);
  } catch (error) {
    console.error('Platform analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

/**
 * GET /analytics/advertiser
 * Returns stats for the logged-in advertiser's campaigns
 */
router.get('/advertiser', authMiddleware, async (req, res) => {
  if (req.user.role !== 'advertiser') return res.status(403).json({ error: 'Forbidden' });

  try {
    const Campaign = require('../models/Campaign');
    const myCampaigns = await Campaign.find({ advertiserId: req.user.id }).select('_id').lean();
    const campaignIds = myCampaigns.map(c => c._id);

    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const stats = await HourlyStat.find({ 
      campaignId: { $in: campaignIds },
      hour: { $gte: yesterday } 
    }).sort({ hour: 1 }).lean();

    const grouped = {};
    for (const s of stats) {
      const h = new Date(s.hour).toISOString();
      if (!grouped[h]) grouped[h] = { time: h, spend: 0, wins: 0, avgLatency: 0, count: 0 };
      grouped[h].spend += s.spend || 0;
      grouped[h].wins += s.wins || 0;
      grouped[h].avgLatency += (s.avgLatencyMs || 0);
      grouped[h].count++;
    }

    const result = Object.values(grouped).map(g => ({
      time: g.time,
      spend: g.spend,
      wins: g.wins,
      avgLatencyMs: g.count ? Math.round(g.avgLatency / g.count) : 0
    }));

    res.json(result);
  } catch (error) {
    console.error('Advertiser analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

/**
 * GET /analytics/publisher
 * Returns stats for the logged-in publisher's slots
 */
router.get('/publisher', authMiddleware, async (req, res) => {
  if (req.user.role !== 'publisher') return res.status(403).json({ error: 'Forbidden' });

  try {
    const Slot = require('../models/Slot');
    const mySlots = await Slot.find({ publisherId: req.user.id }).select('_id').lean();
    const slotIds = mySlots.map(s => s._id);

    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const stats = await HourlyStat.find({ 
      slotId: { $in: slotIds },
      hour: { $gte: yesterday } 
    }).sort({ hour: 1 }).lean();

    const grouped = {};
    for (const s of stats) {
      const h = new Date(s.hour).toISOString();
      if (!grouped[h]) grouped[h] = { time: h, revenue: 0, wins: 0, avgLatency: 0, count: 0 };
      grouped[h].revenue += s.revenue || 0;
      grouped[h].wins += s.wins || 0;
      grouped[h].avgLatency += (s.avgLatencyMs || 0);
      grouped[h].count++;
    }

    const result = Object.values(grouped).map(g => ({
      time: g.time,
      revenue: g.revenue,
      wins: g.wins,
      avgLatencyMs: g.count ? Math.round(g.avgLatency / g.count) : 0
    }));

    res.json(result);
  } catch (error) {
    console.error('Publisher analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

module.exports = router;
