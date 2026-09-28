const mongoose = require('mongoose');
const { processHourlyRollup } = require('./hourlyRollupJob');
const AuctionLog = require('../models/AuctionLog');
const HourlyStat = require('../models/HourlyStat');

async function runTest() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/rtb-test');
  
  // Clear DB
  await AuctionLog.deleteMany({});
  await HourlyStat.deleteMany({});

  const startHour = new Date();
  startHour.setHours(startHour.getHours() - 1, 0, 0, 0); // Previous hour

  const c1 = new mongoose.Types.ObjectId();
  const c2 = new mongoose.Types.ObjectId();
  const s1 = new mongoose.Types.ObjectId();
  const s2 = new mongoose.Types.ObjectId();

  // Create mock logs in the previous hour
  const logs = [];
  
  // Slot 1, Campaign 1 wins, bid 200, latency 50
  for(let i=0; i<10; i++) {
    logs.push({ slotId: s1, winningCampaignId: c1, winningBid: 200, latencyMs: 50, timestamp: new Date(startHour.getTime() + 1000) });
  }
  // Slot 2, Campaign 2 wins, bid 300, latency 30
  for(let i=0; i<5; i++) {
    logs.push({ slotId: s2, winningCampaignId: c2, winningBid: 300, latencyMs: 30, timestamp: new Date(startHour.getTime() + 2000) });
  }
  // No bids
  logs.push({ slotId: s1, winningCampaignId: null, winningBid: null, latencyMs: 10, timestamp: new Date(startHour.getTime() + 3000) });

  await AuctionLog.insertMany(logs);

  // Run rollup
  await processHourlyRollup({ data: { targetTime: new Date() } }); // Use current time so it rolls up previous hour

  // Verify
  const c1Stats = await HourlyStat.findOne({ campaignId: c1, hour: startHour });
  const c2Stats = await HourlyStat.findOne({ campaignId: c2, hour: startHour });
  const s1Stats = await HourlyStat.findOne({ slotId: s1, hour: startHour });

  let passed = 0;
  let failed = 0;

  function assert(desc, actual, expected) {
    if (actual === expected) {
      console.log(`  ✓ ${desc}`);
      passed++;
    } else {
      console.error(`  ✗ ${desc} — expected ${expected}, got ${actual}`);
      failed++;
    }
  }

  assert('c1 wins = 10', c1Stats.wins, 10);
  assert('c1 spend = 2000', c1Stats.spend, 2000);
  assert('c2 wins = 5', c2Stats.wins, 5);
  assert('c2 spend = 1500', c2Stats.spend, 1500);

  assert('s1 wins = 10', s1Stats.wins, 10);
  // Revenue: 2000 gross. Assuming 10% platform fee = 200. Publisher revenue = 1800.
  assert('s1 revenue = 1800', s1Stats.revenue, 1800);

  console.log(`\n${passed} passed, ${failed} failed`);
  
  await mongoose.disconnect();
  
  if (failed > 0) process.exit(1);
}

runTest().catch(console.error);
