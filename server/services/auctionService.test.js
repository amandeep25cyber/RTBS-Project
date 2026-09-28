const mongoose = require('mongoose');
const Redis = require('ioredis');
const { processAuction } = require('./auctionService');
const socketService = require('./socketService');
const User = require('../models/User');
const Campaign = require('../models/Campaign');
const Slot = require('../models/Slot');
const AuctionLog = require('../models/AuctionLog');
const Transaction = require('../models/Transaction');

async function runTest() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/rtb-test');
  const redis = new Redis(process.env.REDIS_PORT || 6379, process.env.REDIS_HOST || 'localhost');

  // Initialize dummy socket service
  socketService.init(require('http').createServer());

  await User.deleteMany({});
  await Campaign.deleteMany({});
  await Slot.deleteMany({});
  await AuctionLog.deleteMany({});
  await Transaction.deleteMany({});
  await redis.flushall();

  // Admin user
  const admin = await User.create({ name: 'Admin', email: 'admin@test.com', passwordHash: '123', role: 'admin' });

  // Advertiser and Publisher
  const adv = await User.create({ name: 'Adv', email: 'adv@test.com', passwordHash: '123', role: 'advertiser', walletBalance: 10000 });
  const pub = await User.create({ name: 'Pub', email: 'pub@test.com', passwordHash: '123', role: 'publisher', earningsBalance: 0 });

  // Campaign
  const c1 = await Campaign.create({
    advertiserId: adv._id,
    name: 'Camp1',
    dailyBudget: 5000,
    maxBid: 200,
    targeting: { geo: ['IN'], device: ['mobile'], category: ['news'] },
    frequencyCapPerDay: 5,
    status: 'active'
  });

  // Slot
  const s1 = await Slot.create({
    publisherId: pub._id,
    slotName: 'Slot1',
    category: 'news',
    floorPrice: 100,
    status: 'active'
  });

  // Seed Redis
  await redis.set(`budget:${c1._id.toString()}`, 5000);
  await redis.sadd('targeting:IN:mobile:news', c1._id.toString());

  console.log('--- processAuction ---');
  const result = await processAuction(s1, redis);
  
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

  assert('winner is c1', result.winner?._id.toString(), c1._id.toString());
  assert('noBid is false', result.noBid, false);

  // Wait briefly for async Mongo transaction and Log insert
  await new Promise(res => setTimeout(res, 500));

  const budget = await redis.get(`budget:${c1._id.toString()}`);
  assert('budget reduced by 200', budget, '4800');

  const freqcap = await redis.get(`freqcap:${adv._id.toString()}:${c1._id.toString()}`);
  assert('freqcap is 1', freqcap, '1');

  const advDb = await User.findById(adv._id);
  assert('advertiser wallet reduced to 9800', advDb.walletBalance, 9800);

  const pubDb = await User.findById(pub._id);
  assert('publisher earnings increased to 180 (10% fee)', pubDb.earningsBalance, 180);

  const logs = await AuctionLog.find();
  assert('AuctionLog created', logs.length, 1);
  assert('AuctionLog winningBid = 200', logs[0].winningBid, 200);

  const txs = await Transaction.find().sort({ amount: -1 });
  assert('3 transactions created', txs.length, 3);

  console.log(`\n${passed} passed, ${failed} failed`);
  
  await mongoose.disconnect();
  await redis.quit();

  if (failed > 0) process.exit(1);
  process.exit(0);
}

runTest().catch(err => {
  console.error(err);
  process.exit(1);
});
