const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/auth');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

/**
 * GET /earnings/balance
 * Returns the current earnings balance for the logged-in publisher
 */
router.get('/balance', authMiddleware, requireRole('publisher'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('earningsBalance').lean();
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    res.json({ balance: user.earningsBalance });
  } catch (error) {
    console.error('earnings balance error:', error);
    res.status(500).json({ error: 'Failed to fetch balance' });
  }
});

/**
 * GET /earnings/transactions
 * Returns paginated earning transactions for the publisher
 * Query: ?page=1&limit=20
 */
router.get('/transactions', authMiddleware, requireRole('publisher'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const transactions = await Transaction.find({ 
      userId: req.user.id, 
      type: 'publisher_earning' 
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Transaction.countDocuments({ 
      userId: req.user.id, 
      type: 'publisher_earning' 
    });

    res.json({
      transactions,
      page,
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    console.error('earnings transactions error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

/**
 * GET /earnings/payouts
 * Returns paginated payout transactions for the publisher
 * Query: ?page=1&limit=20
 */
router.get('/payouts', authMiddleware, requireRole('publisher'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const payouts = await Transaction.find({ 
      userId: req.user.id, 
      type: 'payout' 
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Transaction.countDocuments({ 
      userId: req.user.id, 
      type: 'payout' 
    });

    res.json({
      payouts,
      page,
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    console.error('earnings payouts error:', error);
    res.status(500).json({ error: 'Failed to fetch payouts' });
  }
});

module.exports = router;
