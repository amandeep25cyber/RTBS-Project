const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/auth');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

router.use(authMiddleware);
router.use(requireRole('admin'));

/**
 * GET /admin/users
 * Returns list of users (advertisers and publishers)
 */
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } })
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .lean();
    res.json(users);
  } catch (error) {
    console.error('admin users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

/**
 * PUT /admin/users/:id/status
 * Blocks or unblocks a user
 * Body: { status: 'active' | 'blocked' | 'under_review' }
 */
router.put('/users/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'blocked', 'under_review'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select('-passwordHash');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('admin update status error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

/**
 * GET /admin/transactions
 * Returns platform-wide transactions (paginated)
 */
router.get('/transactions', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const transactions = await Transaction.find()
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Transaction.countDocuments();

    res.json({
      transactions,
      page,
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    console.error('admin transactions error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

/**
 * GET /admin/platform-revenue
 * Returns sum of all platform_fee transactions
 */
router.get('/platform-revenue', async (req, res) => {
  try {
    const result = await Transaction.aggregate([
      { $match: { type: 'platform_fee', status: 'completed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }
    ]);

    const totalRevenue = result.length > 0 ? result[0].totalRevenue : 0;
    res.json({ totalRevenue });
  } catch (error) {
    console.error('admin revenue error:', error);
    res.status(500).json({ error: 'Failed to fetch revenue' });
  }
});

module.exports = router;
