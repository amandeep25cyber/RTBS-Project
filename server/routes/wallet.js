const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Razorpay = require('razorpay');
const { authMiddleware, requireRole } = require('../middleware/auth');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');

// Initialize Razorpay conditionally (allows tests to pass without real keys)
let razorpay;
if (process.env.PAYMENT_GATEWAY_KEY_ID && process.env.PAYMENT_GATEWAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.PAYMENT_GATEWAY_KEY_ID,
    key_secret: process.env.PAYMENT_GATEWAY_KEY_SECRET,
  });
}

/**
 * POST /wallet/add-funds
 * Creates a pending payment session (order). Does NOT touch wallet balance.
 * Body: { amount: Number (paise) }
 */
router.post('/add-funds', authMiddleware, requireRole('advertiser'), async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0 paise' });
    }

    if (!razorpay) {
      // For mock/development if keys aren't set
      return res.json({ 
        orderId: `mock_order_${Date.now()}`,
        amount, 
        currency: 'INR' 
      });
    }

    const options = {
      amount, // amount in smallest currency unit
      currency: "INR",
      receipt: `receipt_${req.user.id}_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);
    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error) {
    console.error('add-funds error:', error);
    res.status(500).json({ error: 'Failed to create payment session' });
  }
});

/**
 * POST /wallet/webhook
 * Called by payment gateway. Verifies signature, checks idempotency, credits wallet.
 */
router.post('/webhook', express.json(), async (req, res) => {
  try {
    const webhookSecret = process.env.PAYMENT_GATEWAY_WEBHOOK_SECRET || 'test_webhook_secret';
    
    // 1. Signature Verification
    const signature = req.headers['x-razorpay-signature'];
    if (!signature) {
      return res.status(400).json({ error: 'Missing signature' });
    }

    const bodyString = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(bodyString)
      .digest('hex');

    if (expectedSignature !== signature) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = req.body.event;
    if (event !== 'payment.captured') {
      return res.status(200).json({ status: 'ignored' });
    }

    const payment = req.body.payload.payment.entity;
    const gatewayTransactionId = payment.id;
    const amount = payment.amount;
    
    // In a real app, receipt might contain user ID, or we fetch it from the linked order.
    // For this implementation, we'll assume notes.userId is passed during payment checkout.
    const userId = payment.notes?.userId;
    if (!userId) {
      console.error('Webhook payload missing userId in notes');
      return res.status(400).json({ error: 'Missing userId' });
    }

    // 2. Idempotency Check
    const existingTx = await Transaction.findOne({ gatewayTransactionId });
    if (existingTx) {
      // Already processed, return success immediately
      return res.status(200).json({ status: 'ok', message: 'Already processed' });
    }

    // 3. Credit wallet using a MongoDB transaction
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { $inc: { walletBalance: amount } },
        { returnDocument: 'after', session }
      );

      if (!user) {
        throw new Error('User not found');
      }

      await Transaction.create([{
        userId: user._id,
        type: 'deposit',
        amount: amount,
        balanceAfter: user.walletBalance,
        gatewayTransactionId,
        status: 'completed'
      }], { session });

      await session.commitTransaction();
    } catch (dbError) {
      await session.abortTransaction();
      throw dbError;
    } finally {
      session.endSession();
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('webhook error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * GET /wallet/transactions
 * Returns paginated transactions for the logged-in advertiser
 * Query: ?page=1&limit=20
 */
router.get('/transactions', authMiddleware, requireRole('advertiser'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const transactions = await Transaction.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Transaction.countDocuments({ userId: req.user.id });

    res.json({
      transactions,
      page,
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    console.error('wallet transactions error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

module.exports = router;
