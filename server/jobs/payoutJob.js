/**
 * payoutJob.js
 * 
 * Weekly cron job.
 * Reads every publisher's accumulated earningsBalance, initiates a bulk payout 
 * (mocked here), logs a 'payout' transaction, and zeroes the earningsBalance.
 */
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');

async function processPayout() {
  console.log('payoutJob: Starting weekly payout processing');
  
  // Find publishers with balance > 0
  const publishers = await User.find({ role: 'publisher', earningsBalance: { $gt: 0 } });
  console.log(`payoutJob: Found ${publishers.length} publishers to pay out`);

  for (const publisher of publishers) {
    const amount = publisher.earningsBalance;
    
    // In a real system, you would call Razorpay/Stripe Payouts API here.
    // For sandbox, we just simulate success.
    console.log(`payoutJob: Payout of ${amount} paise to ${publisher.email} initiated...`);

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const updatedUser = await User.findByIdAndUpdate(
        publisher._id,
        { $inc: { earningsBalance: -amount } },
        { returnDocument: 'after', session }
      );

      await Transaction.create([{
        userId: updatedUser._id,
        type: 'payout',
        amount: amount,
        balanceAfter: updatedUser.earningsBalance,
        status: 'completed'
      }], { session });

      await session.commitTransaction();
      console.log(`payoutJob: Paid out ${amount} to ${publisher.email}`);
    } catch (error) {
      await session.abortTransaction();
      console.error(`payoutJob: Failed to process payout for ${publisher.email}`, error);
    } finally {
      session.endSession();
    }
  }
}

module.exports = { processPayout };
