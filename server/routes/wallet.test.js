const mongoose = require('mongoose');
const crypto = require('crypto');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

const request = require('supertest');
const express = require('express');
const walletRoutes = require('./wallet');

const app = express();
app.use('/wallet', walletRoutes);

async function runTest() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/rtb-test');
  await User.deleteMany({});
  await Transaction.deleteMany({});

  const adv = await User.create({ name: 'Adv', email: 'adv@test.com', passwordHash: '123', role: 'advertiser', walletBalance: 0 });

  const webhookSecret = 'test_webhook_secret';
  const payload = {
    event: 'payment.captured',
    payload: {
      payment: {
        entity: {
          id: 'pay_123',
          amount: 5000,
          notes: { userId: adv._id.toString() }
        }
      }
    }
  };
  const bodyString = JSON.stringify(payload);
  const signature = crypto.createHmac('sha256', webhookSecret).update(bodyString).digest('hex');

  console.log('--- webhook test ---');
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

  // 1. First webhook call
  const res1 = await request(app)
    .post('/wallet/webhook')
    .set('x-razorpay-signature', signature)
    .send(payload);
  
  assert('First webhook returns 200 ok', res1.status, 200);

  const updatedAdv = await User.findById(adv._id);
  assert('Wallet balance increased to 5000', updatedAdv.walletBalance, 5000);
  
  const txs = await Transaction.find();
  assert('1 transaction created', txs.length, 1);
  assert('Transaction gatewayTransactionId set', txs[0].gatewayTransactionId, 'pay_123');

  // 2. Second webhook call (idempotency check)
  const res2 = await request(app)
    .post('/wallet/webhook')
    .set('x-razorpay-signature', signature)
    .send(payload);
  
  assert('Second webhook returns 200 ok (already processed)', res2.status, 200);

  const updatedAdv2 = await User.findById(adv._id);
  assert('Wallet balance remains 5000', updatedAdv2.walletBalance, 5000);
  
  const txs2 = await Transaction.find();
  assert('Still only 1 transaction', txs2.length, 1);

  console.log(`\n${passed} passed, ${failed} failed`);
  
  await mongoose.disconnect();
  if (failed > 0) process.exit(1);
  process.exit(0);
}

runTest().catch(err => {
  console.error(err);
  process.exit(1);
});
